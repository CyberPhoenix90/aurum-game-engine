import { ArrayDataSource, Renderable, DataSource, Aurum } from 'aurumjs';
import { LabelEntityStyle, Label } from '../../entities/label_entity';
import { PointLike } from '../../models/point';
import { Data } from '../../models/input_data';
import { animate } from '../../graphics/animation/animate';
import { Vector2D } from '../../math/vectors/vector2d';
import { Shader } from '../../models/entities';

export interface IFloatingMessageOptions {
	position: PointLike;
	fadeIn?: number;
	fadeOut?: number;
	duration: number;
	movement?: PointLike;
	output: ArrayDataSource<Renderable>;
	shaders?: Shader[];
	baseStyle?: LabelEntityStyle;
}

export class FloatingMessageService {
	public async displayMessage(message: Data<string>, floatingMessageOptions: IFloatingMessageOptions): Promise<void> {
		const alpha = new DataSource(0);
		const x = new DataSource(floatingMessageOptions.position.x);
		const y = new DataSource(floatingMessageOptions.position.y);
		const msg = (
			<Label shaders={floatingMessageOptions.shaders} x={x} y={y} {...floatingMessageOptions.baseStyle} alpha={alpha}>
				{message}
			</Label>
		);

		floatingMessageOptions.output.push(msg);

		if (!floatingMessageOptions.fadeIn) {
			alpha.update(1);
		}

		if (floatingMessageOptions.movement) {
			this.processMovement(
				{ x, y },
				floatingMessageOptions.movement,
				(floatingMessageOptions.fadeIn || 0) + (floatingMessageOptions.fadeOut || 0) + floatingMessageOptions.duration
			);
		}

		if (floatingMessageOptions.fadeIn) {
			await animate(
				(progress: number) => {
					alpha.update(progress);
				},
				{
					duration: floatingMessageOptions.fadeIn
				}
			);
		}

		setTimeout(async () => {
			if (floatingMessageOptions.fadeOut) {
				await animate(
					(progress: number) => {
						alpha.update(1 - progress);
					},
					{
						duration: floatingMessageOptions.fadeOut
					}
				);
			}
			floatingMessageOptions.output.remove(msg);
		}, floatingMessageOptions.duration);
	}

	private processMovement({ x, y }: { x: DataSource<number>; y: DataSource<number> }, movement: PointLike, time: number) {
		let posX = x.value;
		let posY = y.value;
		animate(
			(p) => {
				const shift = Vector2D.fromPointLike(movement).mul(p);
				x.update(posX + shift.x);
				y.update(posY + shift.y);
			},
			{
				duration: time
			}
		);
	}
}

export const floatingMessageService: FloatingMessageService = new FloatingMessageService();
