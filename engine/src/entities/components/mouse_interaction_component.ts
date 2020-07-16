import { AbstractComponent } from './abstract_component';
import { CommonEntity } from '../../models/entities';
import { SceneGraphNode } from '../../models/scene_graph';
import { CameraEntity } from '../camera';
import { AurumMouse, MouseButtons } from '../../input/mouse/mouse';
import { EntityRenderModel } from '../../rendering/model';
import { EventEmitter } from 'aurumjs';
import { collisionCalculator } from '../../math/shapes/collision_calculator';
import { Point } from '../../math/shapes/point';
import { Rectangle } from '../../math/shapes/rectangle';

export type Source = { entity: SceneGraphNode<CommonEntity>; renderData: EntityRenderModel };

export interface MouseInteractionConfig {
	mouse: AurumMouse;
	cameras: CameraEntity[];
	onClick?({ e: MouseEvent, source: Source }): void;
	onMouseDown?(e?: { e: MouseEvent; source: Source }): void;
	onMouseUp?(e?: { e: MouseEvent; source: Source }): void;
	onMouseMove?(e?: { e: MouseEvent; source: Source }): void;
	onMouseEnter?(e?: { e: MouseEvent; source: Source }): void;
	onMouseLeave?(e?: { e: MouseEvent; source: Source }): void;
	onScroll?(e?: { e: MouseWheelEvent; source: Source }): void;
}

export class MouseInteractionComponent extends AbstractComponent {
	private config: MouseInteractionConfig;
	public isMouseOver: boolean;
	public onClick: EventEmitter<{ e: MouseEvent; source: Source }>;
	public onMouseDown: EventEmitter<{ e: MouseEvent; source: Source }>;
	public onMouseMove: EventEmitter<{ e: MouseEvent; source: Source }>;
	public onMouseUp: EventEmitter<{ e: MouseEvent; source: Source }>;
	public onMouseEnter: EventEmitter<{ e: MouseEvent; source: Source }>;
	public onMouseLeave: EventEmitter<{ e: MouseEvent; source: Source }>;
	public onScroll: EventEmitter<{ e: MouseWheelEvent; source: Source }>;

	constructor(config: MouseInteractionConfig) {
		super();
		this.config = config;
		this.isMouseOver = false;

		this.onClick = new EventEmitter<{ e: MouseEvent; source: Source }>();
		this.onMouseDown = new EventEmitter<{ e: MouseEvent; source: Source }>();
		this.onMouseUp = new EventEmitter<{ e: MouseEvent; source: Source }>();
		this.onMouseMove = new EventEmitter<{ e: MouseEvent; source: Source }>();
		this.onMouseEnter = new EventEmitter<{ e: MouseEvent; source: Source }>();
		this.onMouseLeave = new EventEmitter<{ e: MouseEvent; source: Source }>();
		this.onScroll = new EventEmitter<{ e: MouseWheelEvent; source: Source }>();

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

	public onAttach(entity: SceneGraphNode<CommonEntity>, renderData: EntityRenderModel) {
		const boundingBox = new Rectangle(
			{ x: renderData.getAbsolutePositionX(), y: renderData.getAbsolutePositionY() },
			{ x: renderData.sizeX.value, y: renderData.sizeY.value }
		);

		this.config.mouse.listenMouseScroll().listen((e) => {
			if (this.onScroll.hasSubscriptions() && renderData.visible.value && !renderData.cancellationToken.isCanceled) {
				for (const camera of this.config.cameras) {
					if (collisionCalculator.isOverlapping(new Point(camera.projectMouseCoordinates(e)), boundingBox)) {
						this.onScroll.fire({ e, source: { entity, renderData } });
					}
				}
			}
		}, renderData.cancellationToken);

		this.config.mouse.listenMouseMove().listen((e) => {
			if (this.onMouseEnter.hasSubscriptions() || this.onMouseLeave.hasSubscriptions()) {
				this.checkMouseEnterOrLeave(e, entity, renderData, boundingBox);
			}
			if (this.onMouseMove.hasSubscriptions()) {
				this.onMouseMove.fire({
					e: e,
					source: { entity, renderData }
				});
			}
		}, renderData.cancellationToken);

		this.config.mouse.listenMouseDown(MouseButtons.LEFT).listen((e) => {
			if (this.onMouseDown.hasSubscriptions() && renderData.visible.value && !renderData.cancellationToken.isCanceled) {
				for (const camera of this.config.cameras) {
					if (collisionCalculator.isOverlapping(new Point(camera.projectMouseCoordinates(e)), boundingBox)) {
						this.onMouseDown.fire({ e: e, source: { entity, renderData } });
					}
				}
			}
		}, renderData.cancellationToken);

		this.config.mouse.listenMouseUp(MouseButtons.LEFT).listen((e) => {
			if (this.onMouseUp.hasSubscriptions() && renderData.visible.value && !renderData.cancellationToken.isCanceled) {
				for (const camera of this.config.cameras) {
					if (collisionCalculator.isOverlapping(new Point(camera.projectMouseCoordinates(e)), boundingBox)) {
						this.onMouseUp.fire({ e: e, source: { entity, renderData } });
					}
				}
			}
		}, renderData.cancellationToken);

		this.config.mouse.listenMouseUp(MouseButtons.LEFT).listen((e) => {
			if (this.onClick.hasSubscriptions() && renderData.visible.value && !renderData.cancellationToken.isCanceled) {
				for (const camera of this.config.cameras) {
					if (collisionCalculator.isOverlapping(new Point(camera.projectMouseCoordinates(e)), boundingBox)) {
						this.onClick.fire({ e: e, source: { entity, renderData } });
					}
				}
			}
		}, renderData.cancellationToken);
	}

	private checkMouseEnterOrLeave(e: MouseEvent, entity: SceneGraphNode<CommonEntity>, renderData: EntityRenderModel, boundinBox: Rectangle): void {
		let isOnTop: boolean;
		for (const camera of this.config.cameras) {
			if (renderData.visible.value && collisionCalculator.isOverlapping(new Point(camera.projectMouseCoordinates(e)), boundinBox)) {
				isOnTop = true;
			}
			if (isOnTop) {
				break;
			}
		}

		if (isOnTop && !this.isMouseOver) {
			this.isMouseOver = true;
			this.onMouseEnter.fire({ e, source: { entity, renderData } });
		} else if (!isOnTop && this.isMouseOver) {
			this.isMouseOver = false;
			this.onMouseLeave.fire({ e, source: { entity, renderData } });
		}
	}
}
