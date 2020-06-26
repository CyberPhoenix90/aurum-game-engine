import { CancellationToken, DataSource } from 'aurumjs';
import { Polygon } from '../../aurum_game_engine';
import { SceneGraphNode } from '../../core/stage';
import { PointLike } from '../../models/point';
import { EntityRenderModel } from '../../rendering/model';
import { AbstractComponent } from './abstract_component';
import { Callback } from 'aurumjs/dist/utilities/common';
import { CommonEntity } from '../../models/entities';

export interface PathFollowingConfiguration {
	speed: number;
}

export class PathFollowingComponent extends AbstractComponent {
	public config: PathFollowingConfiguration;
	public pause: boolean;
	private currentTarget: PointLike;
	private pendingMovementPromise: Callback<void>;

	constructor(config: PathFollowingConfiguration) {
		super();
		this.config = config;
		this.pause = false;
	}

	public onAttach(entity: SceneGraphNode<CommonEntity>, renderData: EntityRenderModel) {
		entity.cancellationToken.animationLoop(() => {
			if (this.currentTarget && !this.pause) {
				this.moveTowardsTarget(entity, this.currentTarget);
			}
		});
	}

	public async followPath(polygon: Polygon): Promise<void> {
		const offset = polygon.position;
		for (const point of polygon.points) {
			await this.moveToPoint({ x: offset.x + point.x, y: offset.y + point.y });
		}
	}

	public async followPathOnLoop(polygon: Polygon, cancellationToken: CancellationToken): Promise<void> {
		const offset = polygon.position;
		let index: number = 0;
		while (!cancellationToken.isCanceled) {
			await this.moveToPoint({ x: offset.x + polygon.points[index].x, y: offset.y + polygon.points[index].y });
			index++;
			if (index >= polygon.points.length) {
				index = 0;
			}
		}
	}

	public async moveToPoint(point: PointLike): Promise<void> {
		this.currentTarget = point;
		await new Promise<void>((resolve) => {
			this.pendingMovementPromise = resolve;
		});
		this.currentTarget = undefined;
	}

	private moveTowardsTarget(entity: SceneGraphNode<CommonEntity>, target: PointLike) {
		if (typeof entity.model.x.value !== 'number') {
			entity.model.x.update(target.x);
		}
		if (typeof entity.model.y.value !== 'number') {
			entity.model.y.update(target.y);
		}

		const positionX: DataSource<number> = entity.model.x as any;
		const positionY: DataSource<number> = entity.model.y as any;

		if (target.x > positionX.value) {
			positionX.update(positionX.value + Math.min(this.config.speed, Math.abs(positionX.value - target.x)));
		} else if (target.x < positionX.value) {
			positionX.update(positionX.value - Math.min(this.config.speed, Math.abs(positionX.value - target.x)));
		} else if (target.y > positionY.value) {
			positionY.update(positionY.value + Math.min(this.config.speed, Math.abs(positionY.value - target.y)));
		} else if (target.y < positionY.value) {
			positionY.update(positionY.value - Math.min(this.config.speed, Math.abs(positionY.value - target.y)));
		}

		if (target.x === positionX.value && target.y === positionY.value) {
			this.pendingMovementPromise();
		}
	}
}
