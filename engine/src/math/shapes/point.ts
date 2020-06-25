import { AbstractShape } from './abstract_shape';
import { Rectangle } from './rectangle';
import { Vector2D } from '../vectors/vector2d';

export class Point extends AbstractShape {
	constructor(position: Vector2D) {
		super(position);
	}

	public isEquivalentTo(p: Point): boolean {
		return this.position.x === p.position.x && this.position.y === p.position.y;
	}

	public getBoundingBox(): Rectangle {
		return new Rectangle(this.position, new Vector2D(1, 1));
	}
}
