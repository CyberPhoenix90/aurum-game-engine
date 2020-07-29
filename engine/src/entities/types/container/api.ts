import { layoutAlgorithm } from '../../../core/layout_engine';
import { RenderableType } from '../../../models/entities';
import { SceneGraphNode, SceneGraphNodeModel } from '../../../models/scene_graph';
import { ContainerEntity, ContainerEntityRenderModel } from './model';

export class ContainerGraphNode extends SceneGraphNode<ContainerEntity> {
	public readonly renderState: ContainerEntityRenderModel;

	constructor(config: SceneGraphNodeModel<ContainerEntity>) {
		super(config);
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
