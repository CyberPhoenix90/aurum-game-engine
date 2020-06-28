import { Sprite, PathFollowingComponent, Polygon, Vector2D } from 'aurum-game-engine';
import { Aurum, AurumComponentAPI } from 'aurumjs';

export interface BulletProps {
	x: number;
	y: number;
	targetX: number;
	targetY: number;
	onBulletEnd(): void;
}

export function Bullet(props: BulletProps, _, api: AurumComponentAPI) {
	const pathFollowing = new PathFollowingComponent({
		speed: 4,
		euclideanMovement: true
	});

	pathFollowing.followPath(new Polygon({ x: 0, y: 0 }, [new Vector2D(props.targetX, props.targetY)])).then(() => props.onBulletEnd());

	return <Sprite components={[pathFollowing]} x={props.x} y={props.y} texture="assets/bullet.png"></Sprite>;
}
