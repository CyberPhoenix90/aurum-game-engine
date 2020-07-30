import { ArrayDataSource, CancellationToken, MapDataSource, DataSource } from 'aurumjs';
import { AbstractComponent } from '../entities/components/abstract_component';
import { EntityRenderModel } from '../rendering/model';
import { Constructor } from './common';
import { CommonEntity } from './entities';
import { _ } from '../utilities/other/streamline';
import { AbstractRenderPlugin } from '../rendering/abstract_render_plugin';

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
	public parent?: SceneGraphNode<CommonEntity>;
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
	private stageId: number;
	private renderPlugin: AbstractRenderPlugin;

	constructor(config: SceneGraphNodeModel<T>) {
		this.name = config.name;
		this.children = config.children ?? new ArrayDataSource([]);
		for (const c of this.children.getData()) {
			this.processChild(c);
		}
		this.cancellationToken = new CancellationToken();
		this.components = config.components;
		this.models = config.models;
		this.uid = _.getUId();
		this.resolvedModel = this.createResolvedModel();
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

	protected processChild(c: SceneGraphNode<CommonEntity> | DataSource<SceneGraphNode<CommonEntity>> | ArrayDataSource<SceneGraphNode<CommonEntity>>): void {
		if (c instanceof DataSource) {
			c = new DataSourceGraphNode(c);
		} else if (c instanceof ArrayDataSource) {
			c = new ArrayDataSourceGraphNode(c);
		}

		c.attachParent(this);
	}

	public attachParent(parent: SceneGraphNode<CommonEntity>) {
		if (this.parent !== undefined) {
			throw new Error(`Node ${this.name} already has a parent`);
		}

		this.parent = parent;
		if (parent.stageId) {
			this.attachToStage(parent.renderPlugin, parent.stageId);
		}
	}

	public attachToStage(renderPlugin: AbstractRenderPlugin, stageId: number) {
		this.cancellationToken.addCancelable(() => {
			renderPlugin.removeNode(this.uid, stageId);
		});
		renderPlugin.addNode(this, stageId);
		this.renderPlugin = renderPlugin;
		this.stageId = stageId;
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
		for (const source of this.modelSourceIterator()) {
			let ptr = source[key];
			if (ptr) {
				if (ptr instanceof DataSource) {
					return ptr as any;
				} else if (ptr instanceof ArrayDataSource) {
					return ptr as any;
				}
			}
		}

		throw new Error('Could not resolve source for key ' + key);
	}

	/**
	 * Hack for typescript to properly infer the types of the datasources by allowing it to assume that they are unchanged between base and extended class
	 */
	private getModelSourceWithFallbackBase<K extends keyof CommonEntity>(
		key: K
	): CommonEntity[K] extends DataSource<infer U> ? DataSource<U> : CommonEntity[K] extends ArrayDataSource<infer U> ? ArrayDataSource<U> : never {
		return this.getModelSourceWithFallback(key);
	}

	protected createBaseResolvedModel(): CommonEntity {
		return {
			alpha: this.getModelSourceWithFallbackBase('alpha'),
			blendMode: this.getModelSourceWithFallbackBase('blendMode'),
			clip: this.getModelSourceWithFallbackBase('clip'),
			height: this.getModelSourceWithFallbackBase('height'),
			ignoreLayout: this.getModelSourceWithFallbackBase('ignoreLayout'),
			marginBottom: this.getModelSourceWithFallbackBase('marginBottom'),
			marginLeft: this.getModelSourceWithFallbackBase('marginLeft'),
			marginRight: this.getModelSourceWithFallbackBase('marginRight'),
			marginTop: this.getModelSourceWithFallbackBase('marginTop'),
			maxHeight: this.getModelSourceWithFallbackBase('maxHeight'),
			maxWidth: this.getModelSourceWithFallbackBase('maxWidth'),
			minHeight: this.getModelSourceWithFallbackBase('minHeight'),
			minWidth: this.getModelSourceWithFallbackBase('minWidth'),
			originX: this.getModelSourceWithFallbackBase('originX'),
			originY: this.getModelSourceWithFallbackBase('originY'),
			scaleX: this.getModelSourceWithFallbackBase('scaleX'),
			scaleY: this.getModelSourceWithFallbackBase('scaleY'),
			shaders: this.getModelSourceWithFallbackBase('shaders'),
			spreadLayout: this.getModelSourceWithFallbackBase('spreadLayout'),
			visible: this.getModelSourceWithFallbackBase('visible'),
			width: this.getModelSourceWithFallbackBase('width'),
			x: this.getModelSourceWithFallbackBase('x'),
			y: this.getModelSourceWithFallbackBase('y'),
			zIndex: this.getModelSourceWithFallbackBase('zIndex')
		};
	}

	protected abstract createResolvedModel(): T;
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
