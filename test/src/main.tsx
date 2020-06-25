import { Rectangle, Camera, Label, Stage, numberFormatter, Container, BoundsComponent, SIDE } from 'aurum-game-engine';
import { PixiJsRenderAdapter } from 'aurum-pixijs-renderer';
import { Aurum, DataSource } from 'aurumjs';

// const scene = new DataSource('test');

// const joy = new AurumGamepad(0, {
// 	joystickDeadzone: 0.05
// }).listenJoystick(0);
const posX = new DataSource(20);
const posY = new DataSource(60);
let velX = 1;
let frame = new DataSource(0);
let velY = 1;
const val = new DataSource(1);

setInterval(() => {
	frame.update(frame.value + 1);
	posX.update(posX.value + velX);
	posY.update(posY.value + velY);
});

setInterval(() => {
	val.update(val.value * 10);
}, 1000);

Aurum.attach(
	<div>
		<Stage renderPlugin={new PixiJsRenderAdapter()}>
			<Container
				x={posX}
				y={posY}
				components={[
					new BoundsComponent({
						bounds: new Rectangle({ x: 0, y: 0 }, { x: 1280, y: 480 }),
						onOutOfBounds: (bound: SIDE) => {
							if (bound === SIDE.LEFT || bound === SIDE.RIGHT) {
								velX *= -1;
							} else {
								velY *= -1;
							}
						}
					})
				]}
			>
				{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
					<Label
						fontWeight={'bold'}
						fontSize={30}
						color={frame.map((frame) => `hsl(${(180 / Math.PI) * (v + frame / 30)},100%,50%)`)}
						x={frame.map((frame) => Math.cos((v + frame / 30) * 0.7) * 30)}
						y={frame.map((frame) => Math.sin((v + frame / 30) * 0.7) * 30)}
					>
						{v}
					</Label>
				))}
			</Container>
			{/* <Sprite tint={'#FF00FF'} x={joy.map((j) => j.x * 320 + 320)} y={joy.map((j) => j.y * 240 + 240)} texture={'images.jpg'}></Sprite> */}
			<Camera screenWidth={1280} screenHeight={480}>
				<Label>
					{val.map((v) =>
						numberFormatter.formatBigNumber({
							value: v,
							minDigits: 2,
							decimals: 2,
							abbreviationProvider: (e) => (e ? ['k', 'm', 'b', 't', 'qa', 'qu', 'se', 'sep', 'oct', 'non'][e / 3 - 1] ?? `e${e}` : ''),
							formatGranularity: 3
						})
					)}
				</Label>
			</Camera>
		</Stage>
	</div>,
	document.body
);
