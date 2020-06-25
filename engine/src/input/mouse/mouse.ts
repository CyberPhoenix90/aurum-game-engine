// import { CancellationToken } from 'aurumjs';

export enum MouseButtons {
	LEFT = 0,
	RIGHT = 2,
	MIDDLE = 3
}

// export type AurumMouseEvent = MouseEvent & { propagationStopped: boolean };

// export class AurumMouse {
// 	/**
// 	 * Fired whenever the browser fires a mouse down event
// 	 */
// 	public readonly onMouseDown: EventEmitter<{ e: AurumMouseEvent; camera: Camera2D }>;
// 	/**
// 	 * Fired whenever the browser fires a click event
// 	 */
// 	public readonly onClick: EventEmitter<{ e: AurumMouseEvent; camera: Camera2D }>;
// 	/**
// 	 * Fired whenever the browser fires a mouse up event
// 	 */
// 	public readonly onMouseUp: EventEmitter<{ e: AurumMouseEvent; camera: Camera2D }>;
// 	/**
// 	 * Fired whenever the browser fires a mouse move event
// 	 */
// 	public readonly onMouseMove: EventEmitter<MouseEvent>;
// 	/**
// 	 * Fired whenever the browser fires a wheel event
// 	 */
// 	public readonly onScroll: EventEmitter<{ e: WheelEvent; camera: Camera2D }>;
// 	public get disposed(): boolean {
// 		return this.cancellationToken.isCanceled;
// 	}

// 	private cancellationToken: CancellationToken;
// 	private heldDownButtons: { [key: number]: boolean };
// 	private lastMouseMove: MouseEvent | undefined;

// 	constructor(camera: Camera2D | Camera2D[]) {
// 		this.heldDownButtons = {};
// 		this.cancellationToken = new CancellationToken();

// 		_.asArray(camera).forEach((c) => {
// 			this.addCamera(c);
// 		});

// 		this.onClick = new EventEmitter({ cancellationToken: this.cancellationToken });
// 		this.onMouseDown = new EventEmitter({ cancellationToken: this.cancellationToken });
// 		this.onMouseUp = new EventEmitter({ cancellationToken: this.cancellationToken });
// 		this.onMouseMove = new EventEmitter({ cancellationToken: this.cancellationToken });
// 		this.onScroll = new EventEmitter({ cancellationToken: this.cancellationToken });

// 		this.cancellationToken.addCancelable(
// 			stage.onPreDraw.subscribe(() => {
// 				if (this.lastMouseMove) {
// 					this.onMouseMove.fire(this.lastMouseMove);
// 					this.lastMouseMove = undefined;
// 				}
// 			}).cancel
// 		);
// 	}

// 	public createMouseDownAction(key: MouseButtons, existingAction?: ActionEmitter): ActionEmitter {
// 		const result = existingAction || new EventEmitter();

// 		this.onMouseDown.subscribe((e) => {
// 			if (e.e.button === key) {
// 				const position = e.camera.projectMouseCoordinates(e.e);
// 				result.fire({
// 					points: [
// 						{
// 							x: position.x,
// 							radius: 1,
// 							y: position.y
// 						}
// 					],
// 					state: true,
// 					value: 1,
// 					inputSource: InputSource.MOUSE,
// 					type: InputType.DISCRETE
// 				});
// 			}
// 		});

// 		return result;
// 	}

// 	public addCamera(camera: Camera2D) {
// 		this.cancellationToken.registerDomEvent(camera.view, 'mousedown', (e: AurumMouseEvent) => {
// 			this.prepareEvent(e);
// 			this.heldDownButtons[e.button] = true;
// 			this.onMouseDown.fire({ e, camera });
// 		});
// 		this.cancellationToken.registerDomEvent(document, 'mouseup', (e: AurumMouseEvent) => {
// 			this.prepareEvent(e);
// 			delete this.heldDownButtons[e.button];
// 			this.onMouseUp.fire({ e, camera });
// 		});
// 		this.cancellationToken.registerDomEvent(camera.view, 'click', (e: AurumMouseEvent) => {
// 			this.prepareEvent(e);
// 			this.onClick.fire({ e, camera });
// 		});
// 		this.cancellationToken.registerDomEvent(camera.view, 'mousemove', (e: MouseEvent) => {
// 			this.lastMouseMove = e;
// 		});
// 		this.cancellationToken.registerDomEvent(camera.view, 'wheel', (e: WheelEvent) => {
// 			this.onScroll.fire({ e, camera });
// 		});
// 	}

// 	private prepareEvent(e: AurumMouseEvent) {
// 		e.propagationStopped = false;
// 		e.stopPropagation = () => {
// 			e.propagationStopped = true;
// 		};
// 		e.stopImmediatePropagation = () => {
// 			e.propagationStopped = true;
// 		};
// 	}

// 	public dispose(): void {
// 		this.cancellationToken.cancel();
// 	}
// }
