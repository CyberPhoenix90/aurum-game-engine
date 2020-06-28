import { CancellationToken, DataSource } from 'aurumjs';
import { Polygon } from '../../aurum_game_engine';
import { PointLike } from '../../models/point';
import { EntityRenderModel } from '../../rendering/model';
import { AbstractComponent } from './abstract_component';
import { Callback } from 'aurumjs/dist/utilities/common';
import { CommonEntity } from '../../models/entities';
import { SceneGraphNode } from '../../models/scene_graph';
import { onBeforeRender } from '../../core/stage';
import { Vector2D } from '../../math/vectors/vector2d';

export interface PathFollowingConfiguration {
	speed: number;
	euclideanMovement?: boolean;
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
		onBeforeRender.subscribe(() => {
			if (this.currentTarget && !this.pause) {
				this.moveTowardsTarget(entity, this.currentTarget);
			}
		}, entity.cancellationToken);
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

		if (this.config.euclideanMovement) {
			this.approachEuclidean(target, positionX, positionY);
		} else {
			this.approachManhattan(target, positionX, positionY);
		}

		if (target.x === positionX.value && target.y === positionY.value) {
			this.pendingMovementPromise();
		}
	}

	private approachEuclidean(target: PointLike, positionX: DataSource<number>, positionY: DataSource<number>) {
		const travel = Vector2D.fromPolarCoordinates(this.config.speed, new Vector2D(positionX.value, positionY.value).connectingVector(target).getAngle());
		positionX.update(positionX.value + Math.min(Math.abs(travel.x), Math.abs(positionX.value - target.x)) * Math.sign(travel.x));
		positionY.update(positionY.value + Math.min(Math.abs(travel.y), Math.abs(positionY.value - target.y)) * Math.sign(travel.y));
	}

	private approachManhattan(target: PointLike, positionX: DataSource<number>, positionY: DataSource<number>) {
		if (target.x > positionX.value) {
			positionX.update(positionX.value + Math.min(this.config.speed, Math.abs(positionX.value - target.x)));
		} else if (target.x < positionX.value) {
			positionX.update(positionX.value - Math.min(this.config.speed, Math.abs(positionX.value - target.x)));
		} else if (target.y > positionY.value) {
			positionY.update(positionY.value + Math.min(this.config.speed, Math.abs(positionY.value - target.y)));
		} else if (target.y < positionY.value) {
			positionY.update(positionY.value - Math.min(this.config.speed, Math.abs(positionY.value - target.y)));
		}
	}
}
