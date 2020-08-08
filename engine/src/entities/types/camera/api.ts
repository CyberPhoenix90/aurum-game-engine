import { layoutAlgorithm } from '../../../core/layout_engine';
import { RenderableType } from '../../../models/entities';
import { PointLike } from '../../../models/point';
import { SceneGraphNode, SceneGraphNodeModel } from '../../../models/scene_graph';
import { CameraEntity, CameraEntityRenderModel } from './model';

export class CameraGraphNode extends SceneGraphNode<CameraEntity> {
	public readonly renderState: CameraEntityRenderModel;

	constructor(config: SceneGraphNodeModel<CameraEntity>) {
		super(config);
	}

	protected createResolvedModel(): CameraEntity {
		const base = this.createBaseResolvedModel() as CameraEntity;
		base.backgroundColor = this.getModelSourceWithFallback('backgroundColor');
		base.resolutionX = this.getModelSourceWithFallback('resolutionX');
		base.resolutionY = this.getModelSourceWithFallback('resolutionY');
		return base;
	}

	protected createRenderModel(): CameraEntityRenderModel {
		const { x, y, sizeX, sizeY } = layoutAlgorithm(this);
		return {
			view: undefined,
			alpha: this.resolvedModel.alpha,
			clip: this.resolvedModel.clip,
			renderableType: RenderableType.CAMERA,
			positionX: x,
			positionY: y,
			sizeX: sizeX,
			sizeY: sizeY,
			scaleX: this.resolvedModel.scaleX,
			scaleY: this.resolvedModel.scaleY,
			visible: this.resolvedModel.visible,
			zIndex: this.resolvedModel.zIndex,
			blendMode: this.resolvedModel.blendMode,
			backgroundColor: this.resolvedModel.backgroundColor,
			shader: this.resolvedModel.shaders
		};
	}

	public projectMouseCoordinates(e: MouseEvent) {
		return this.projectPoint({
			x: e.clientX,
			y: e.clientY
		});
	}

	public projectPoint(point: PointLike): PointLike {
		const rect = this.renderState.view.getBoundingClientRect();
		return {
			x:
				((point.x - rect.left + this.renderState.positionX.value) * this.renderState.sizeX.value) /
				(this.getModelValueWithFallback('resolutionX') || this.renderState.sizeX.value),
			y:
				((point.y - rect.top + this.renderState.positionY.value) * this.renderState.sizeY.value) /
				(this.getModelValueWithFallback('resolutionY') || this.renderState.sizeY.value)
		};
	}
}
