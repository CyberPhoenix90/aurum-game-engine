import { Container, onBeforeRender, Sprite, Vector2D } from 'aurum-game-engine';
import { Aurum, AurumComponentAPI } from 'aurumjs';
import { bullets, enemiesData } from '../session';
import { Bullet } from './bullet';
export interface TowerProps {
	x: number;
	y: number;
}

export function Tower(props: TowerProps, children: [], api: AurumComponentAPI) {
	const selfPosition = Vector2D.zero();
	let cd;

	onBeforeRender.subscribe(() => {
		if (cd > Date.now()) {
			return;
		}

		for (const d of enemiesData.getData()) {
			const enemyPosition = new Vector2D(d.positionX.value + d.sizeX.value / 2, d.positionY.value + d.sizeY.value / 2);
			if (enemyPosition.distanceTo(selfPosition) < 200) {
				const bullet = (
					<Bullet
						onBulletEnd={() => {
							bullets.remove(bullet);
						}}
						x={selfPosition.x + 8}
						y={selfPosition.y}
						targetX={enemyPosition.x}
						targetY={enemyPosition.y}
					></Bullet>
				);
				bullets.push(bullet);
				cd = Date.now() + 1;
				// break;
			}
		}
	}, api.cancellationToken);
	return (
		<Container
			onAttach={(n, r) => {
				r.positionX.listenAndRepeat((x) => (selfPosition.x = x));
				r.positionY.listenAndRepeat((y) => (selfPosition.y = y));
			}}
			x={props.x}
			y={props.y}
		>
			<Sprite drawOffsetX={32} drawDistanceX={32} drawDistanceY={64} texture="assets/tower.png"></Sprite>
		</Container>
	);
}
