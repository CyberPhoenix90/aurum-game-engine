import { Graphics } from 'pixi.js';
import { NoRenderEntity } from './pixi_no_render_entity';
import { PaintOperation, CanvasEntityRenderModel, Color, Rectangle, Circle, Polygon, AbstractShape, ComposedShape } from 'aurum-game-engine';
import { ArrayDataSource } from 'aurumjs';

export class RenderCanvasEntity extends NoRenderEntity {
	public displayObject: Graphics;
	private paintOperations: ArrayDataSource<PaintOperation>;

	constructor(config: CanvasEntityRenderModel) {
		super(config);
		this.paintOperations = config.painerOperations;
		this.paintOperations.listenAndRepeat(() => {
			this.updateRenderPayload();
		}, config.cancellationToken);
	}

	protected createDisplayObject() {
		return new Graphics();
	}

	public renderAction(renderPayload) {
		this.drawAction(renderPayload.action);
	}

	public updateRenderPayload() {
		this.displayObject.clear();
		this.drawAll();
	}

	private drawAll() {
		for (const action of this.paintOperations.getData()) {
			this.drawAction(action);
		}
	}

	private drawAction(action: PaintOperation) {
		const color = Color.fromString(action.fillStyle ?? 'transparent');
		this.displayObject.beginFill(color.toRGBNumber(), color.a / 256);
		const strokeColor = Color.fromString(action.strokeStyle ?? 'transparent');
		this.displayObject.lineStyle(action.strokeThickness ?? 1, strokeColor.toRGBNumber(), strokeColor.a / 256);
		const shape = action.shape;
		this.renderShape(shape);
	}

	private renderShape(shape: AbstractShape, offsetX: number = 0, offsetY: number = 0) {
		if (shape instanceof Rectangle) {
			this.displayObject.drawRect(shape.x + offsetX, shape.y + offsetY, shape.width, shape.height);
		} else if (shape instanceof Circle) {
			this.displayObject.drawCircle(shape.x + offsetX, shape.y + offsetY, shape.radius);
		} else if (shape instanceof Polygon) {
			for (const point of shape.points) {
				if (point === shape.points[0]) {
					this.displayObject.moveTo(point.x + shape.x + offsetX, point.y + offsetY + shape.y);
				} else {
					this.displayObject.lineTo(point.x + shape.x + offsetX, point.y + offsetY + shape.y);
				}
			}
		} else if (shape instanceof ComposedShape) {
			for (const subShape of shape.shapes) {
				this.renderShape(subShape, offsetX + shape.x, offsetY + shape.y);
			}
		}
	}
}
