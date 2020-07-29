import { layoutAlgorithm } from '../../../core/layout_engine';
import { RenderableType } from '../../../models/entities';
import { SceneGraphNode, SceneGraphNodeModel } from '../../../models/scene_graph';
import { SpriteEntity, SpriteEntityRenderModel } from './model';

export class SpriteGraphNode extends SceneGraphNode<SpriteEntity> {
	public readonly renderState: SpriteEntityRenderModel;

	constructor(config: SceneGraphNodeModel<SpriteEntity>) {
		super(config);
	}

	protected createResolvedModel(): SpriteEntity {
		const base = this.createBaseResolvedModel();
		return base;
	}

	protected createRenderModel(): SpriteEntityRenderModel {
		const { x, y, sizeX, sizeY } = layoutAlgorithm(this);
		return {
			alpha: this.resolvedModel.alpha,
			clip: this.resolvedModel.clip,
			renderableType: RenderableType.SPRITE,
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
			tint: this.resolvedModel.tint,
			texture: this.resolvedModel.texture,
			drawDistanceX: this.resolvedModel.drawDistanceX,
			drawDistanceY: this.resolvedModel.drawDistanceY,
			drawOffsetX: this.resolvedModel.drawOffsetX,
			drawOffsetY: this.resolvedModel.drawOffsetY
		};
	}
}
