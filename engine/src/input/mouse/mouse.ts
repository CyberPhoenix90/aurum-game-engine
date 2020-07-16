// import { CancellationToken } from 'aurumjs';

import { CancellationToken, DataSource } from 'aurumjs';

export enum MouseButtons {
	LEFT = 0,
	RIGHT = 2,
	MIDDLE = 3
}

export class AurumMouse {
	private heldDownButtons: { [key: number]: boolean };
	private lastPositionX: number;
	private lastPositionY: number;
	private cancellationToken: CancellationToken;
	private mouseDown: DataSource<MouseEvent>;
	private mouseUp: DataSource<MouseEvent>;
	private mouseMove: DataSource<MouseEvent>;
	private mouseScroll: DataSource<WheelEvent>;

	constructor() {
		this.cancellationToken = new CancellationToken();
		this.heldDownButtons = {};
		this.mouseDown = new DataSource();
		this.mouseUp = new DataSource();
		this.mouseMove = new DataSource();
		this.mouseScroll = new DataSource();

		this.cancellationToken.registerDomEvent(document, 'mousemove', (e: any) => {
			this.lastPositionX = (e as MouseEvent).clientX;
			this.lastPositionY = (e as MouseEvent).clientY;
			this.mouseMove.update(e);
		});
		this.cancellationToken.registerDomEvent(document, 'mousedown', (e: any) => {
			this.heldDownButtons[(e as MouseEvent).button] = true;
			this.mouseDown.update(e);
		});
		this.cancellationToken.registerDomEvent(document, 'mouseup', (e: any) => {
			this.heldDownButtons[(e as MouseEvent).button] = false;
			this.mouseUp.update(e);
		});
		this.cancellationToken.registerDomEvent(document, 'wheel', (e: any) => {
			this.mouseScroll.update(e);
		});
	}

	public listenMouseDown(key: MouseButtons): DataSource<MouseEvent> {
		const result = new DataSource<MouseEvent>();

		this.mouseDown.filter((e) => e.button === key).pipe(result);

		return result;
	}

	public listenMouseMove(): DataSource<MouseEvent> {
		const result = new DataSource<MouseEvent>();

		this.mouseMove.pipe(result);

		return result;
	}

	public listenMouseScroll(): DataSource<WheelEvent> {
		const result = new DataSource<WheelEvent>();

		this.mouseScroll.pipe(result);

		return result;
	}

	public listenMouseUp(key: MouseButtons): DataSource<MouseEvent> {
		const result = new DataSource<MouseEvent>();

		this.mouseUp.filter((e) => e.button === key).pipe(result);

		return result;
	}

	public getMouseX(): number {
		return this.lastPositionX;
	}

	public getMouseY(): number {
		return this.lastPositionY;
	}

	public isButtonDown(key: MouseButtons): boolean {
		return this.heldDownButtons[key];
	}

	public dispose(): void {
		this.cancellationToken.cancel();
	}
}
