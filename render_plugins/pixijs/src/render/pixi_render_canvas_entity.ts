import { Graphics } from 'pixi.js';
import { NoRenderEntity } from './pixi_no_render_entity';
import { PaintOperation, CanvasEntityRenderModel, Color, Rectangle, Circle, Polygon, AbstractShape, ComposedShape } from 'aurum-game-engine';
import { ArrayDataSource, DataSource, CancellationToken } from 'aurumjs';

export class RenderCanvasEntity extends NoRenderEntity {
	public displayObject: Graphics;
	private paintOperations: ArrayDataSource<PaintOperation>;
	private drawToken: CancellationToken;

	constructor(config: CanvasEntityRenderModel) {
		super(config);
		this.paintOperations = config.painerOperations;
		this.paintOperations.listenAndRepeat(() => {
			this.drawAll();
		}, config.cancellationToken);
	}

	protected createDisplayObject() {
		return new Graphics();
	}

	private drawAll() {
		if (this.drawToken) {
			this.drawToken.cancel();
		}
		this.drawToken = new CancellationToken();
		this.displayObject.clear();
		for (const action of this.paintOperations.getData()) {
			this.drawAction(action, this.drawToken);
		}
	}

	private drawAction(action: PaintOperation, token: CancellationToken) {
		if (action.fillStyle instanceof DataSource) {
			action.fillStyle.listen(() => {
				this.drawAll();
			}, token);
		}

		if (action.strokeStyle instanceof DataSource) {
			action.strokeStyle.listen(() => {
				this.drawAll();
			}, token);
		}

		if (action.strokeThickness instanceof DataSource) {
			action.strokeThickness.listen(() => {
				this.drawAll();
			}, token);
		}

		const color = Color.fromString(action.fillStyle instanceof DataSource ? action.fillStyle.value : action.fillStyle ?? 'transparent');
		this.displayObject.beginFill(color.toRGBNumber(), color.a / 256);
		const strokeColor = Color.fromString(action.strokeStyle instanceof DataSource ? action.strokeStyle.value : action.strokeStyle ?? 'transparent');
		this.displayObject.lineStyle(
			action.strokeThickness instanceof DataSource ? action.strokeThickness.value : action.strokeThickness ?? 1,
			strokeColor.toRGBNumber(),
			strokeColor.a / 256
		);
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
