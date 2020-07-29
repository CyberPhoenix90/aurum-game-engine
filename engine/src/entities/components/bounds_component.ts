import { Rectangle } from '../../math/shapes/rectangle';
import { SIDE } from '../../models/common';
import { CommonEntity } from '../../models/entities';
import { SceneGraphNode } from '../../models/scene_graph';
import { AbstractComponent } from './abstract_component';

export interface BoundsConfig {
	bounds: Rectangle;
	onOutOfBounds(bound: SIDE, entity: SceneGraphNode<CommonEntity>): void;
}

export class BoundsComponent extends AbstractComponent {
	private config: BoundsConfig;

	constructor(config: BoundsConfig) {
		super();
		this.config = config;
	}

	public onAttach(entity: SceneGraphNode<CommonEntity>) {
		entity.renderState.positionX.listen(() => {
			const { bounds } = this.config;
			if (entity.renderState.positionX.value < bounds.x) {
				this.config.onOutOfBounds(SIDE.LEFT, entity);
			}
			if (entity.renderState.positionX.value > bounds.x + bounds.width) {
				this.config.onOutOfBounds(SIDE.RIGHT, entity);
			}
		});

		entity.renderState.positionY.listen(() => {
			const { bounds } = this.config;
			if (entity.renderState.positionY.value < bounds.y) {
				this.config.onOutOfBounds(SIDE.TOP, entity);
			}
			if (entity.renderState.positionY.value > bounds.y + bounds.height) {
				this.config.onOutOfBounds(SIDE.BOTTOM, entity);
			}
		});
	}
}
