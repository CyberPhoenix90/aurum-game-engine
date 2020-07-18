import { CancellationToken, DataSource } from 'aurumjs';
import { Callback } from 'aurumjs/dist/utilities/common';
import { Polygon } from '../../aurum_game_engine';
import { onBeforeRender } from '../../core/stage';
import { CommonEntity } from '../../models/entities';
import { PointLike } from '../../models/point';
import { SceneGraphNode } from '../../models/scene_graph';
import { EntityRenderModel } from '../../rendering/model';
import { AbstractMovementComponent } from './abstract_movement_component';

export class PathFollowingComponent extends AbstractMovementComponent {
	private currentTarget: PointLike;
	private pendingMovementPromise: Callback<void>;
	private renderData: EntityRenderModel;

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

	protected moveTowardsTarget(entity: SceneGraphNode<CommonEntity>, target: PointLike, delta: number) {
		super.moveTowardsTarget(entity, target, delta);
		if (target.x === entity.model.x.value && target.y === entity.model.y.value) {
			this.pendingMovementPromise();
		}
	}
}
