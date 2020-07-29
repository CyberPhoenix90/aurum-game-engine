import { layoutAlgorithm } from '../../../core/layout_engine';
import { RenderableType } from '../../../models/entities';
import { SceneGraphNode, SceneGraphNodeModel } from '../../../models/scene_graph';
import { CanvasEntity, CanvasEntityRenderModel } from './model';

export class CanvasGraphNode extends SceneGraphNode<CanvasEntity> {
	public readonly renderState: CanvasEntityRenderModel;

	constructor(config: SceneGraphNodeModel<CanvasEntity>) {
		super(config);
	}

	protected createResolvedModel(): CanvasEntity {
		const base = this.createBaseResolvedModel();
		return base;
	}

	protected createRenderModel(): CanvasEntityRenderModel {
		const { x, y, sizeX, sizeY } = layoutAlgorithm(this);
		return {
			alpha: this.resolvedModel.alpha,
			clip: this.resolvedModel.clip,
			renderableType: RenderableType.CANVAS,
			positionX: x,
			positionY: y,
			sizeX: sizeX,
			sizeY: sizeY,
			scaleX: this.resolvedModel.scaleX,
			scaleY: this.resolvedModel.scaleY,
			visible: this.resolvedModel.visible,
			zIndex: this.resolvedModel.zIndex,
			blendMode: this.resolvedModel.blendMode,
			shader: this.resolvedModel.shaders,
			paintOperations: this.resolvedModel.paintOperations
		};
	}
}
