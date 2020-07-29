import { ArrayDataSource, CancellationToken, MapDataSource, DataSource } from 'aurumjs';
import { AbstractComponent } from '../entities/components/abstract_component';
import { EntityRenderModel } from '../rendering/model';
import { Constructor } from './common';
import { CommonEntity } from './entities';
import { _ } from '../utilities/other/streamline';

export interface SceneGraphNodeModel<T> {
	name?: string;
	components?: MapDataSource<Constructor<AbstractComponent>, AbstractComponent>;
	children: ArrayDataSource<SceneGraphNode<any>>;
	models: {
		coreDefault: CommonEntity;
		entityTypeDefault: T;
		appliedStyleClasses: ArrayDataSource<T>;
		userSpecified: T;
	};
	onAttach?(entity: SceneGraphNode<T>);
	onDetach?(entity: SceneGraphNode<T>);
}

export abstract class SceneGraphNode<T extends CommonEntity> {
	public readonly renderState: EntityRenderModel;
	public name?: string;
	public readonly components?: MapDataSource<Constructor<AbstractComponent>, AbstractComponent>;
	public readonly parent?: SceneGraphNode<CommonEntity>;
	public readonly uid: number;
	public readonly resolvedModel: T;
	public readonly models: {
		coreDefault: CommonEntity;
		entityTypeDefault: T;
		appliedStyleClasses: ArrayDataSource<T>;
		userSpecified: T;
	};
	public readonly cancellationToken: CancellationToken;
	public readonly children: ArrayDataSource<SceneGraphNode<CommonEntity>>;

	constructor(config: SceneGraphNodeModel<T>) {
		this.name = config.name;
		this.cancellationToken = new CancellationToken();
		this.components = config.components;
		this.models = config.models;
		this.uid = _.getUId();
		this.renderState = this.createRenderModel();
		this.cancellationToken.addCancelable(() => {
			config.onDetach?.(this);
		});

		this.components.listen((change) => {
			if (change.deleted) {
				change.oldValue.onDetach();
			} else {
				change.newValue.onAttach(this);
			}
		}, this.cancellationToken);
	}

	public getModelValueWithFallback<K extends keyof T>(key: K): T[K] extends DataSource<infer U> ? U : T[K] extends ArrayDataSource<infer U> ? U[] : never {
		let collection;
		for (const source of this.modelSourceIterator()) {
			let ptr = source[key];
			if (ptr) {
				if (ptr instanceof DataSource) {
					if (ptr.value !== undefined) {
						return ptr.value;
					}
				} else if (ptr instanceof ArrayDataSource) {
					if (!collection) {
						collection = [];
					}
					collection.push(...ptr.getData());
				}
			}
		}

		return undefined;
	}

	public getModelSourceWithFallback<K extends keyof T>(
		key: K
	): T[K] extends DataSource<infer U> ? DataSource<U> : T[K] extends ArrayDataSource<infer U> ? ArrayDataSource<U> : never {
		let collection;
		for (const source of this.modelSourceIterator()) {
			let ptr = source[key];
			if (ptr) {
				if (ptr instanceof DataSource) {
					if (ptr.value !== undefined) {
						return ptr.value;
					}
				} else if (ptr instanceof ArrayDataSource) {
					if (!collection) {
						collection = [];
					}
					collection.push(...ptr.getData());
				}
			}
		}

		return undefined;
	}

	protected createBaseResolvedModel(): CommonEntity {
		return {
			alpha: this.createResolvedDataSource('alpha')
		};
	}

	private createResolvedDataSource<K extends keyof T>(key: K): T[K] {
		const result: DataSource<any> = new DataSource();
		let ptr;
		for (const source of this.modelSourceIterator()) {
			let tmp;
			if (source[key] && source[key]) {
				tmp = source[key];
				if (tmp instanceof DataSource) {
					tmp.listen((v) => {
						if (ptr === tmp) {
							result.update(v);
						}
					});
					if (tmp.value !== undefined) {
						ptr = tmp;
					}
				}
			}
		}

		return undefined;
	}

	protected abstract createResolvedModel(): CommonEntity;
	protected abstract createRenderModel(): EntityRenderModel;

	public getAbsolutePositionX(): number {
		let x = this.renderState.positionX.value;
		let ptr = this.parent;
		while (ptr) {
			x += ptr.renderState.positionX.value;
			ptr = ptr.parent;
		}
		return x;
	}

	public getAbsolutePositionY(): number {
		let y = this.renderState.positionY.value;
		let ptr = this.parent;
		while (ptr) {
			y += ptr.renderState.positionY.value;
			ptr = ptr.parent;
		}
		return y;
	}

	public *modelSourceIterator(): IterableIterator<T> {
		yield this.models.userSpecified;
		yield* this.models.appliedStyleClasses.getData();
		yield this.models.entityTypeDefault;
		yield this.models.coreDefault as T;
	}

	public hasComponent<T extends AbstractComponent>(type: Constructor<T>): boolean {
		return this.components.has(type);
	}

	public getComponent<T extends AbstractComponent>(type: Constructor<T>): T {
		return this.components.get(type) as T;
	}
}
