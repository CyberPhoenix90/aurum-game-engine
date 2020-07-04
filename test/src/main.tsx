import {
	AurumMouse,
	AurumKeyboard,
	Camera,
	Container,
	EntityRenderModel,
	KeyboardButtons,
	Polygon,
	Sprite,
	Stage,
	Vector2D,
	_,
	Canvas,
	PointLike,
	Label
} from 'aurum-game-engine';
import { PixiJsRenderAdapter } from 'aurum-pixijs-renderer';
import { ArrayDataSource, Aurum, DataSource } from 'aurumjs';
import { Enemy } from './enemy/enemy';
import { bullets, enemiesData, lives } from './session';
import { Tower } from './tower/tower';

const pos = new DataSource<PointLike>();
const enemies = new ArrayDataSource([]);
const enemyPath = new Polygon({ x: 0, y: 0 }, [
	new Vector2D(40, -70),
	new Vector2D(40, 550),
	new Vector2D(750, 550),
	new Vector2D(750, 150),
	new Vector2D(850, 150)
]);

Aurum.attach(
	<div>
		<Stage renderPlugin={new PixiJsRenderAdapter()}>
			<Container>
				<Sprite name="background" texture="assets/bg.png"></Sprite>
				<Canvas
					paintOperations={[
						{
							strokeStyle: '#FF000050',
							strokeThickness: 4,
							shape: enemyPath
						}
					]}
				></Canvas>
				<Container>
					{lives.map((v) =>
						_.for(v, (i) => <Sprite tint="#ff0000" x={600 + 40 * i} y={10} scaleX={0.15} scaleY={0.15} texture="assets/enemy.png"></Sprite>)
					)}
					{enemies}
					{bullets}
					<Tower x={200} y={250}></Tower>
					<Tower x={300} y={450}></Tower>
					<Tower x={600} y={450}></Tower>
					<Sprite tint="#ff0000" x={pos.pick('x')} y={pos.pick('y')} width={24} height={24} texture="assets/enemy.png"></Sprite>
					<Label x={400} y={60} stroke="black" color="white">
						Center Test A
					</Label>
					<Label x={400} y={80} color="red" originX={0.5} scaleX={2} scaleY={2}>
						Center Test B
					</Label>
					<Label x={400} y={100} color="red" originX={1}>
						Center Test C
					</Label>
				</Container>
			</Container>
			<Camera
				onAttach={(camera) => {
					new AurumMouse()
						.listenMouseMove()
						.map(camera.model.projectMouseCoordinates)
						.map((v) => ({ x: v.x - 12, y: v.y - 12 }))
						.pipe(pos);
				}}
				screenWidth={800}
				screenHeight={600}
			></Camera>
		</Stage>
	</div>,
	document.body
);

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
