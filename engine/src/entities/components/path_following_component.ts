import { CancellationToken, DataSource, TransientDataSource } from 'aurumjs';
import { Polygon } from '../../aurum_game_engine';
import { PointLike } from '../../models/point';
import { EntityRenderModel } from '../../rendering/model';
import { AbstractComponent } from './abstract_component';
import { Callback } from 'aurumjs/dist/utilities/common';
import { CommonEntity } from '../../models/entities';
import { SceneGraphNode } from '../../models/scene_graph';
import { onBeforeRender, engineClock } from '../../core/stage';
import { Vector2D } from '../../math/vectors/vector2d';
import { Clock } from '../../game_features/time/clock';

export interface PathFollowingConfiguration {
	speed: number;
	euclideanMovement?: boolean;
	clock?: Clock;
}

export class PathFollowingComponent extends AbstractComponent {
	public config: PathFollowingConfiguration;
	public pause: boolean;
	private currentTarget: PointLike;
	private pendingMovementPromise: Callback<void>;
	private movementListeners: DataSource<PointLike>;
	private renderData: EntityRenderModel;
	private clock: Clock;

	constructor(config: PathFollowingConfiguration) {
		super();
		this.config = config;
		this.pause = false;
		this.clock = config.clock ?? engineClock;
		this.movementListeners = new DataSource();
	}

	public predictPosition(inMs: number): PointLike {
		if (this.pause) {
			return { x: this.renderData.positionX.value, y: this.renderData.positionY.value };
		} else {
			const positionX = new DataSource(this.renderData.positionX.value);
			const positionY = new DataSource(this.renderData.positionY.value);
			while (inMs > 0) {
				const chunk = Math.min(inMs, 33);
				if (this.config.euclideanMovement) {
					this.approachEuclidean(this.currentTarget, positionX, positionY, chunk);
				} else {
					this.approachManhattan(this.currentTarget, positionX, positionY, chunk);
				}
				inMs -= chunk;
			}
			return { x: positionX.value, y: positionY.value };
		}
	}

	public listenMovement(cancellationToken?: CancellationToken): TransientDataSource<PointLike> {
		const token = cancellationToken ?? new CancellationToken();
		const result = new TransientDataSource<PointLike>(token);

		this.movementListeners.pipe(result, token);

		return result;
	}

	public stop(): void {
		this.pause = true;
	}

	public resume(): void {
		this.pause = false;
	}

	public onAttach(entity: SceneGraphNode<CommonEntity>, renderData: EntityRenderModel) {
		this.renderData = renderData;
		let time = this.clock.timestamp;
		onBeforeRender.subscribe(() => {
			const delta = this.clock.timestamp - time;
			time += delta;
			if (this.currentTarget && !this.pause) {
				this.moveTowardsTarget(entity, this.currentTarget, delta);
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

	private moveTowardsTarget(entity: SceneGraphNode<CommonEntity>, target: PointLike, delta: number) {
		if (this.pause) {
			return;
		}

		if (typeof entity.model.x.value !== 'number') {
			entity.model.x.update(target.x);
		}
		if (typeof entity.model.y.value !== 'number') {
			entity.model.y.update(target.y);
		}

		const positionX: DataSource<number> = entity.model.x as any;
		const positionY: DataSource<number> = entity.model.y as any;

		if (this.config.euclideanMovement) {
			this.approachEuclidean(target, positionX, positionY, delta);
		} else {
			this.approachManhattan(target, positionX, positionY, delta);
		}

		if (target.x === positionX.value && target.y === positionY.value) {
			this.pendingMovementPromise();
		}
	}

	private approachEuclidean(target: PointLike, positionX: DataSource<number>, positionY: DataSource<number>, time: number) {
		const travel = Vector2D.fromPolarCoordinates(
			this.config.speed * time,
			new Vector2D(positionX.value, positionY.value).connectingVector(target).getAngle()
		);
		positionX.update(positionX.value + Math.min(Math.abs(travel.x), Math.abs(positionX.value - target.x)) * Math.sign(travel.x));
		positionY.update(positionY.value + Math.min(Math.abs(travel.y), Math.abs(positionY.value - target.y)) * Math.sign(travel.y));
		this.movementListeners.update({
			x: Math.min(Math.abs(travel.x), Math.abs(positionX.value - target.x)) * Math.sign(travel.x),
			y: Math.min(Math.abs(travel.y), Math.abs(positionY.value - target.y)) * Math.sign(travel.y)
		});
	}

	private approachManhattan(target: PointLike, positionX: DataSource<number>, positionY: DataSource<number>, time: number) {
		if (target.x > positionX.value) {
			positionX.update(positionX.value + Math.min(this.config.speed * time, Math.abs(positionX.value - target.x)));
			this.movementListeners.update({
				x: Math.min(this.config.speed * time, Math.abs(positionX.value - target.x)),
				y: 0
			});
		} else if (target.x < positionX.value) {
			positionX.update(positionX.value - Math.min(this.config.speed * time, Math.abs(positionX.value - target.x)));
			this.movementListeners.update({
				x: -Math.min(this.config.speed * time, Math.abs(positionX.value - target.x)),
				y: 0
			});
		} else if (target.y > positionY.value) {
			positionY.update(positionY.value + Math.min(this.config.speed * time, Math.abs(positionY.value - target.y)));
			this.movementListeners.update({
				x: 0,
				y: Math.min(this.config.speed * time, Math.abs(positionY.value - target.y))
			});
		} else if (target.y < positionY.value) {
			positionY.update(positionY.value - Math.min(this.config.speed * time, Math.abs(positionY.value - target.y)));
			this.movementListeners.update({
				x: 0,
				y: -Math.min(this.config.speed * time, Math.abs(positionY.value - target.y))
			});
		}
	}
}
