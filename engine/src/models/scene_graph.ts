import { ArrayDataSource, CancellationToken, MapDataSource, DataSource, Renderable, render } from 'aurumjs';
import { AbstractComponent } from '../entities/components/abstract_component';
import { EntityRenderModel } from '../rendering/model';
import { Constructor } from './common';
import { CommonEntity, RenderableType } from './entities';
import { _ } from '../utilities/other/streamline';
import { AbstractRenderPlugin } from '../rendering/abstract_render_plugin';
import { entityDefaults } from '../entities/entity_defaults';
import { layoutAlgorithm } from '../core/layout_engine';
import { ContainerEntity, ContainerEntityRenderModel } from '../entities/types/container/model';
import { ContainerGraphNodeModel } from '../entities/types/container/api';

export interface SceneGraphNodeModel<T> {
	name?: string;
	components?: MapDataSource<Constructor<AbstractComponent>, AbstractComponent>;
	children: ArrayDataSource<SceneGraphNode<CommonEntity> | ArrayDataSource<Renderable> | DataSource<Renderable>>;
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
	public readonly children: ArrayDataSource<ArrayDataSource<Renderable> | DataSource<Renderable> | SceneGraphNode<CommonEntity>>;
	protected readonly processedChildren: ArrayDataSource<SceneGraphNode<CommonEntity>>;
	private stageId: number;
	private renderPlugin: AbstractRenderPlugin;
	onAttach?(entity: SceneGraphNode<T>);
	onDetach?(entity: SceneGraphNode<T>);

	constructor(config: SceneGraphNodeModel<T>) {
		this.onAttach = config.onAttach;
		this.onDetach = config.onDetach;
		this.name = config.name;
		this.children = config.children ?? new ArrayDataSource([]);
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
				if (this.stageId) {
					change.oldValue.onDetach();
				}
			} else {
				if (this.stageId) {
					change.newValue.onAttach(this);
				}
			}
		}, this.cancellationToken);

		this.processedChildren = this.children.map(this.processChild);
		this.processedChildren.listenAndRepeat((change) => {
			switch (change.operationDetailed) {
				case 'insert':
				case 'prepend':
				case 'append':
					for (const item of change.items) {
						item.attachParent(this);
					}
					break;

				case 'remove':
				case 'removeLeft':
				case 'removeRight':
				case 'clear':
					for (const item of change.items) {
						item.dispose();
					}
					break;
			}
		});
	}

	protected processChild(c: SceneGraphNode<CommonEntity> | DataSource<Renderable> | ArrayDataSource<Renderable>): SceneGraphNode<CommonEntity> {
		if (c instanceof DataSource) {
			c = new DataSourceSceneGraphNode(c);
		} else if (c instanceof ArrayDataSource) {
			c = new ArrayDataSourceSceneGraphNode(c);
		}

		return c;
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
		renderPlugin.addNode(this, stageId);
		for (const child of this.processedChildren.getData()) {
			child.attachToStage(renderPlugin, stageId);
		}
		this.renderPlugin = renderPlugin;
		this.stageId = stageId;
		this.onAttach?.(this);
		for (const component of this.components.values()) {
			component.onAttach(this);
		}
	}

	public dispose(): void {
		if (this.parent) {
			if (!this.parent.cancellationToken.isCanceled) {
				this.parent.children.remove(this);
			}
			this.parent = undefined;
		}
		if (this.stageId) {
			this.renderPlugin.removeNode(this.uid, this.stageId);
			this.onDetach?.(this);
			for (const component of this.components.values()) {
				component.onDetach();
			}
			this.stageId = undefined;
		}
		if (!this.cancellationToken.isCanceled) {
			this.cancellationToken.cancel();
		}
		for (const child of this.processedChildren.getData()) {
			child.dispose();
		}
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

export class ContainerGraphNode extends SceneGraphNode<ContainerEntity> {
	public readonly renderState: ContainerEntityRenderModel;

	constructor(config: ContainerGraphNodeModel) {
		super({
			children: config.children ?? new ArrayDataSource(),
			models: {
				appliedStyleClasses: config.models.appliedStyleClasses,
				coreDefault: entityDefaults,
				entityTypeDefault: {},
				userSpecified: config.models.userSpecified
			},
			components: config.components,
			name: config.name,
			onAttach: config.onAttach,
			onDetach: config.onDetach
		});
	}

	protected createResolvedModel(): ContainerEntity {
		const base = this.createBaseResolvedModel();
		return base;
	}

	protected createRenderModel(): ContainerEntityRenderModel {
		const { x, y, sizeX, sizeY } = layoutAlgorithm(this);
		return {
			alpha: this.resolvedModel.alpha,
			clip: this.resolvedModel.clip,
			renderableType: RenderableType.NO_RENDER,
			positionX: x,
			positionY: y,
			sizeX: sizeX,
			sizeY: sizeY,
			scaleX: this.resolvedModel.scaleX,
			scaleY: this.resolvedModel.scaleY,
			visible: this.resolvedModel.visible,
			zIndex: this.resolvedModel.zIndex,
			blendMode: this.resolvedModel.blendMode,
			shader: this.resolvedModel.shaders
		};
	}
}

export class ArrayDataSourceSceneGraphNode extends ContainerGraphNode {
	constructor(dataSource: ArrayDataSource<Renderable>) {
		super({
			children: new ArrayDataSource(),
			name: ArrayDataSourceSceneGraphNode.name,
			models: {
				coreDefault: entityDefaults,
				entityTypeDefault: {},
				appliedStyleClasses: new ArrayDataSource(),
				userSpecified: {}
			},
			components: new MapDataSource(new Map())
		});

		const dynamicRenderKeys = new Map<Renderable, SceneGraphNode<any>>();
		dataSource.listenAndRepeat((change) => {
			switch (change.operation) {
				case 'add':
					for (const item of change.items) {
						const node = this.renderableToNode(item);
						dynamicRenderKeys.set(item, node);
						this.children.insertAt(change.index, node);
					}
					break;
				case 'remove':
					for (const item of change.items) {
						this.children.remove(dynamicRenderKeys.get(item));
					}
					break;
				case 'replace':
					this.children.remove(dynamicRenderKeys.get(change.target));
					const node = this.renderableToNode(change.items[0]);
					dynamicRenderKeys.set(change.items[0], node);
					this.children.set(change.index, node);
					break;
			}
		});
	}

	private renderableToNode(item: Renderable): SceneGraphNode<any> {
		const s = {
			attachCalls: [],
			sessionToken: undefined,
			tokens: []
		};

		const result = render(item, s) as SceneGraphNode<any>;
		s.attachCalls.forEach((ac) => ac());
		return result;
	}
}

export class DataSourceSceneGraphNode extends ContainerGraphNode {
	constructor(dataSource: DataSource<Renderable>) {
		super({
			children: new ArrayDataSource(),
			name: DataSourceSceneGraphNode.name,
			models: {
				coreDefault: entityDefaults,
				entityTypeDefault: {},
				appliedStyleClasses: new ArrayDataSource(),
				userSpecified: {}
			},
			components: new MapDataSource(new Map())
		});

		let cleanUp: CancellationToken;
		dataSource.listenAndRepeat((v) => {
			if (cleanUp) {
				cleanUp.cancel();
			}
			cleanUp = new CancellationToken();

			const s = {
				attachCalls: [],
				sessionToken: cleanUp,
				tokens: []
			};
			const subNodes = render(v, s);

			for (const n of subNodes) {
				if (n.cancellationToken) {
					cleanUp.chain(n.cancellationToken);
				}
			}
			this.children.appendArray(subNodes);
			s.attachCalls.forEach((ac) => ac());
		});
	}
}
