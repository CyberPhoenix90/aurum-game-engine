import { AurumKeyboard, Camera, Container, EntityRenderModel, KeyboardButtons, Polygon, Sprite, Stage, Vector2D, _ } from 'aurum-game-engine';
import { PixiJsRenderAdapter } from 'aurum-pixijs-renderer';
import { ArrayDataSource, Aurum } from 'aurumjs';
import { Enemy } from './enemy/enemy';
import { bullets, enemiesData, lives } from './session';
import { Tower } from './tower/tower';

const enemies = new ArrayDataSource([]);

Aurum.attach(
	<div>
		<Stage renderPlugin={new PixiJsRenderAdapter()}>
			<Container>
				<Sprite name="background" texture="assets/bg.png"></Sprite>
				<Container>
					{lives.map((v) =>
						_.for(v, (i) => <Sprite tint="#ff0000" x={600 + 40 * i} y={10} width={32} height={32} texture="assets/enemy.png"></Sprite>)
					)}
					{enemies}
					{bullets}
					<Tower x={200} y={250}></Tower>
					<Tower x={300} y={450}></Tower>
					<Tower x={600} y={450}></Tower>
				</Container>
			</Container>
			<Camera screenWidth={800} screenHeight={600}></Camera>
		</Stage>
	</div>,
	document.body
);

const enemyPath = new Polygon({ x: 0, y: 0 }, [new Vector2D(40, -70), new Vector2D(40, 550), new Vector2D(750, 150), new Vector2D(850, 150)]);
new AurumKeyboard().listenKey(KeyboardButtons.KEY_A).listen((v) => {
	if (v) {
		setInterval(() => {
			const e = (
				<Enemy
					onReachEndOfPath={() => {
						lives.update(lives.value - 1);
						enemies.remove(e);
					}}
					onAttach={(node, renderModel: EntityRenderModel) => {
						enemiesData.push(renderModel);
					}}
					onDetach={(node, renderModel: EntityRenderModel) => {
						enemiesData.remove(renderModel);
					}}
					path={enemyPath}
				></Enemy>
			);

			enemies.push(e);
		}, 33);
	}
});
