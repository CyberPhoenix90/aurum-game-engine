import { EventEmitter } from 'aurumjs';
import { AurumMouse, MouseButtons } from '../../input/mouse/mouse';
import { collisionCalculator } from '../../math/shapes/collision_calculator';
import { Point } from '../../math/shapes/point';
import { Rectangle } from '../../math/shapes/rectangle';
import { CommonEntity } from '../../models/entities';
import { SceneGraphNode } from '../../models/scene_graph';
import { AbstractComponent } from './abstract_component';
import { CameraGraphNode } from '../types/camera/api';

export interface MouseInteractionConfig {
	mouse: AurumMouse;
	cameras: CameraGraphNode[];
	onClick?(e: { e: MouseEvent; source: SceneGraphNode<CommonEntity> }): void;
	onMouseDown?(e: { e: MouseEvent; source: SceneGraphNode<CommonEntity> }): void;
	onMouseUp?(e: { e: MouseEvent; source: SceneGraphNode<CommonEntity> }): void;
	onMouseMove?(e: { e: MouseEvent; source: SceneGraphNode<CommonEntity> }): void;
	onMouseEnter?(e: { e: MouseEvent; source: SceneGraphNode<CommonEntity> }): void;
	onMouseLeave?(e: { e: MouseEvent; source: SceneGraphNode<CommonEntity> }): void;
	onScroll?(e: { e: MouseWheelEvent; source: SceneGraphNode<CommonEntity> }): void;
}

export class MouseInteractionComponent extends AbstractComponent {
	private config: MouseInteractionConfig;
	public isMouseOver: boolean;
	public onClick: EventEmitter<{ e: MouseEvent; source: SceneGraphNode<CommonEntity> }>;
	public onMouseDown: EventEmitter<{ e: MouseEvent; source: SceneGraphNode<CommonEntity> }>;
	public onMouseMove: EventEmitter<{ e: MouseEvent; source: SceneGraphNode<CommonEntity> }>;
	public onMouseUp: EventEmitter<{ e: MouseEvent; source: SceneGraphNode<CommonEntity> }>;
	public onMouseEnter: EventEmitter<{ e: MouseEvent; source: SceneGraphNode<CommonEntity> }>;
	public onMouseLeave: EventEmitter<{ e: MouseEvent; source: SceneGraphNode<CommonEntity> }>;
	public onScroll: EventEmitter<{ e: MouseWheelEvent; source: SceneGraphNode<CommonEntity> }>;

	constructor(config: MouseInteractionConfig) {
		super();
		this.config = config;
		this.isMouseOver = false;

		this.onClick = new EventEmitter<{ e: MouseEvent; source: SceneGraphNode<CommonEntity> }>();
		this.onMouseDown = new EventEmitter<{ e: MouseEvent; source: SceneGraphNode<CommonEntity> }>();
		this.onMouseUp = new EventEmitter<{ e: MouseEvent; source: SceneGraphNode<CommonEntity> }>();
		this.onMouseMove = new EventEmitter<{ e: MouseEvent; source: SceneGraphNode<CommonEntity> }>();
		this.onMouseEnter = new EventEmitter<{ e: MouseEvent; source: SceneGraphNode<CommonEntity> }>();
		this.onMouseLeave = new EventEmitter<{ e: MouseEvent; source: SceneGraphNode<CommonEntity> }>();
		this.onScroll = new EventEmitter<{ e: MouseWheelEvent; source: SceneGraphNode<CommonEntity> }>();

		if (config.onClick) {
			this.onClick.subscribe(config.onClick);
		}

		if (config.onMouseEnter) {
			this.onMouseEnter.subscribe(config.onMouseEnter);
		}

		if (config.onMouseDown) {
			this.onMouseDown.subscribe(config.onMouseDown);
		}

		if (config.onMouseUp) {
			this.onMouseUp.subscribe(config.onMouseUp);
		}

		if (config.onMouseMove) {
			this.onMouseMove.subscribe(config.onMouseMove);
		}

		if (config.onMouseLeave) {
			this.onMouseLeave.subscribe(config.onMouseLeave);
		}

		if (config.onScroll) {
			this.onScroll.subscribe(config.onScroll);
		}
	}

	public onAttach(entity: SceneGraphNode<CommonEntity>) {
		this.config.mouse.listenMouseScroll().listen((e) => {
			const boundingBox = this.makeBoundingBox(entity);

			//@ts-ignore
			if (e.propagationStopped) {
				return;
			}
			if (this.onScroll.hasSubscriptions() && entity.renderState.visible.value && !entity.cancellationToken.isCanceled) {
				for (const camera of this.config.cameras) {
					if (collisionCalculator.isOverlapping(new Point(camera.projectMouseCoordinates(e)), boundingBox)) {
						this.onScroll.fire({ e, source: entity });
					}
				}
			}
		}, entity.cancellationToken);

		this.config.mouse.listenMouseMove().listen((e) => {
			const boundingBox = this.makeBoundingBox(entity);
			//@ts-ignore
			if (e.propagationStopped) {
				return;
			}
			if (this.onMouseEnter.hasSubscriptions() || this.onMouseLeave.hasSubscriptions()) {
				this.checkMouseEnterOrLeave(e, entity, boundingBox);
			}
			if (this.onMouseMove.hasSubscriptions()) {
				this.onMouseMove.fire({
					e: e,
					source: entity
				});
			}
		}, entity.cancellationToken);

		this.config.mouse.listenMouseDown(MouseButtons.LEFT).listen((e) => {
			const boundingBox = this.makeBoundingBox(entity);
			//@ts-ignore
			if (e.propagationStopped) {
				return;
			}
			if (this.onMouseDown.hasSubscriptions() && entity.renderState.visible.value && !entity.cancellationToken.isCanceled) {
				for (const camera of this.config.cameras) {
					if (collisionCalculator.isOverlapping(new Point(camera.projectMouseCoordinates(e)), boundingBox)) {
						this.onMouseDown.fire({ e: e, source: entity });
					}
				}
			}
		}, entity.cancellationToken);

		this.config.mouse.listenMouseUp(MouseButtons.LEFT).listen((e) => {
			const boundingBox = this.makeBoundingBox(entity);
			//@ts-ignore
			if (e.propagationStopped) {
				return;
			}
			if (this.onMouseUp.hasSubscriptions() && entity.renderState.visible.value && !entity.cancellationToken.isCanceled) {
				for (const camera of this.config.cameras) {
					if (collisionCalculator.isOverlapping(new Point(camera.projectMouseCoordinates(e)), boundingBox)) {
						this.onMouseUp.fire({ e: e, source: entity });
					}
				}
			}
		}, entity.cancellationToken);
	}

	private makeBoundingBox(node: SceneGraphNode<CommonEntity>) {
		return new Rectangle(
			{ x: node.getAbsolutePositionX(), y: node.getAbsolutePositionY() },
			{ x: node.renderState.sizeX.value, y: node.renderState.sizeY.value }
		);
	}

	private checkMouseEnterOrLeave(e: MouseEvent, entity: SceneGraphNode<CommonEntity>, boundinBox: Rectangle): void {
		let isOnTop: boolean;
		for (const camera of this.config.cameras) {
			if (entity.renderState.visible.value && collisionCalculator.isOverlapping(new Point(camera.projectMouseCoordinates(e)), boundinBox)) {
				isOnTop = true;
			}
			if (isOnTop) {
				break;
			}
		}

		if (isOnTop && !this.isMouseOver) {
			this.isMouseOver = true;
			this.onMouseEnter.fire({ e, source: entity });
		} else if (!isOnTop && this.isMouseOver) {
			this.isMouseOver = false;
			this.onMouseLeave.fire({ e, source: entity });
		}
	}
}
