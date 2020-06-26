import { SceneGraphNode } from '../../core/stage';
import { Rectangle } from '../../math/shapes/rectangle';
import { SIDE } from '../../models/common';
import { EntityRenderModel } from '../../rendering/model';
import { AbstractComponent } from './abstract_component';
import { CommonEntity } from '../../models/entities';

export interface BoundsConfig {
	bounds: Rectangle;
	onOutOfBounds(bound: SIDE, renderData: EntityRenderModel): void;
}

export class BoundsComponent extends AbstractComponent {
	private config: BoundsConfig;

	constructor(config: BoundsConfig) {
		super();
		this.config = config;
	}

	public onAttach(entity: SceneGraphNode<CommonEntity>, renderData: EntityRenderModel) {
		renderData.positionX.listen(() => {
			const { bounds } = this.config;
			if (renderData.positionX.value < bounds.x) {
				this.config.onOutOfBounds(SIDE.LEFT, renderData);
			}
			if (renderData.positionX.value > bounds.x + bounds.width) {
				this.config.onOutOfBounds(SIDE.RIGHT, renderData);
			}
		});

		renderData.positionY.listen(() => {
			const { bounds } = this.config;
			if (renderData.positionY.value < bounds.y) {
				this.config.onOutOfBounds(SIDE.TOP, renderData);
			}
			if (renderData.positionY.value > bounds.y + bounds.height) {
				this.config.onOutOfBounds(SIDE.BOTTOM, renderData);
			}
		});
	}
}
