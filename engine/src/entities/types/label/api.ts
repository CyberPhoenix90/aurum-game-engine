import { layoutAlgorithm } from '../../../core/layout_engine';
import { RenderableType } from '../../../models/entities';
import { SceneGraphNode, SceneGraphNodeModel } from '../../../models/scene_graph';
import { LabelEntity, LabelEntityRenderModel } from './model';

export class LabelGraphNode extends SceneGraphNode<LabelEntity> {
	public readonly renderState: LabelEntityRenderModel;

	constructor(config: SceneGraphNodeModel<LabelEntity>) {
		super(config);
	}

	protected createResolvedModel(): LabelEntity {
		const base = this.createBaseResolvedModel();
		return base;
	}

	protected createRenderModel(): LabelEntityRenderModel {
		const { x, y, sizeX, sizeY } = layoutAlgorithm(this);
		return {
			alpha: this.resolvedModel.alpha,
			clip: this.resolvedModel.clip,
			renderableType: RenderableType.LABEL,
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
			text: this.resolvedModel.text,
			color: this.resolvedModel.color,
			dropShadowAngle: this.resolvedModel.dropShadowAngle,
			renderCharCount: this.resolvedModel.renderCharCount,
			stroke: this.resolvedModel.stroke,
			strokeThickness: this.resolvedModel.strokeThickness,
			fontSize: this.resolvedModel.fontSize,
			fontFamily: this.resolvedModel.fontFamily,
			fontStyle: this.resolvedModel.fontStyle,
			fontWeight: this.resolvedModel.fontWeight,
			dropShadowColor: this.resolvedModel.dropShadowColor,
			dropShadowDistance: this.resolvedModel.dropShadowDistance,
			dropShadowFuzziness: this.resolvedModel.dropShadowFuzziness,
			textBaseline: this.resolvedModel.textBaseline,
			dropShadow: this.resolvedModel.dropShadow
		};
	}
}
