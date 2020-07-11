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
	Label,
	floatingMessageService
} from 'aurum-game-engine';
import { PixiJsRenderAdapter } from 'aurum-pixijs-renderer';
import { ArrayDataSource, Aurum, DataSource, Renderable } from 'aurumjs';
import { Enemy } from './enemy/enemy';
import { bullets, enemiesData, lives } from './session';
import { Tower } from './tower/tower';

const pos = new DataSource<PointLike>();
const enemies = new ArrayDataSource([]);
const floatingMessageContainer = new ArrayDataSource<Renderable>();
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
					<Label x={600} y={10} color="red">
						{lives}
					</Label>
					{enemies}
					{bullets}
					<Tower x={200} y={250}></Tower>
					<Tower x={300} y={450}></Tower>
					<Tower x={600} y={450}></Tower>
					<Sprite tint="#ff0000" x={pos.pick('x')} y={pos.pick('y')} width={24} height={24} texture="assets/enemy.png"></Sprite>
					<Label x={400} y={60} stroke="black" color="white">
						Center Test A
					</Label>
					<Label
						shaders={[
							{
								vertex: `
								attribute vec2 aVertexPosition;
								attribute vec2 aTextureCoord;
								uniform mat3 projectionMatrix;
								varying vec2 vTextureCoord;
								void main()
								{
									gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
									vTextureCoord = aTextureCoord;
								}`,
								fragment: `varying vec2 vTextureCoord;
								uniform sampler2D uSampler;

								uniform float thickness;
								uniform vec4 outlineColor;
								uniform vec4 filterArea;
								uniform vec4 filterClamp;
								vec2 px = vec2(1.0 / filterArea.x, 1.0 / filterArea.y);

								void main(void) {
									const float PI = 3.14159265358979323846264;
									vec4 ownColor = texture2D(uSampler, vTextureCoord);
									vec4 curColor;
									float maxAlpha = 0.;
									vec2 displaced;

									for (float angle = 0.; angle < PI * 2.; angle ++) {
										displaced.x = vTextureCoord.x + thickness * px.x * cos(angle);
										displaced.y = vTextureCoord.y + thickness * px.y * sin(angle);
										curColor = texture2D(uSampler, clamp(displaced, filterClamp.xy, filterClamp.zw));
										maxAlpha = max(maxAlpha, curColor.a);
									}
									float resultAlpha = max(maxAlpha, ownColor.a);
									gl_FragColor = vec4((ownColor.rgb + outlineColor.rgb * (1. - ownColor.a)) * resultAlpha, resultAlpha);
								}`,
								uniforms: {
									thickness: 1.0
								}
							}
						]}
						x={400}
						y={80}
						color="white"
						originX={0.5}
						scaleX={2}
						scaleY={2}
					>
						Center Test B
					</Label>
					<Label x={400} y={100} color="red" originX={1}>
						Center Test C
					</Label>
					{floatingMessageContainer}
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

const key = new AurumKeyboard();
key.listenKey(KeyboardButtons.KEY_3).listen(
	(v) =>
		v &&
		floatingMessageService.displayMessage('hello floating messages', {
			duration: 1500,
			fadeIn: 700,
			fadeOut: 700,
			output: floatingMessageContainer,
			movement: {
				x: 0,
				y: -90
			},
			position: { x: 50, y: 350 },
			baseStyle: {
				color: 'red',
				fontSize: 60,
				fontFamily: 'Comic Sans MS'
			}
		})
);
key.listenKey(KeyboardButtons.KEY_1).listen((v) => v && lives.update(lives.value - 1));
key.listenKey(KeyboardButtons.KEY_2).listen((v) => v && lives.update(lives.value + 1));
key.listenKey(KeyboardButtons.KEY_A).listen((v) => {
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
		}, 330);
	}
});
