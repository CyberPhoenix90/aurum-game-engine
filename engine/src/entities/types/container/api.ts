import { ArrayDataSource, MapDataSource } from 'aurumjs';
import { layoutAlgorithm } from '../../../core/layout_engine';
import { Constructor } from '../../../models/common';
import { RenderableType } from '../../../models/entities';
import { SceneGraphNode } from '../../../models/scene_graph';
import { AbstractComponent } from '../../components/abstract_component';
import { ContainerEntity, ContainerEntityRenderModel } from './model';
import { entityDefaults } from '../../entity_defaults';

export interface ContainerGraphNodeModel {
	name?: string;
	components?: MapDataSource<Constructor<AbstractComponent>, AbstractComponent>;
	children?: ArrayDataSource<SceneGraphNode<any>>;
	models: {
		appliedStyleClasses?: ArrayDataSource<ContainerEntity>;
		userSpecified: ContainerEntity;
	};
	onAttach?(node: ContainerGraphNode): void;
	onDetach?(node: ContainerGraphNode): void;
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
