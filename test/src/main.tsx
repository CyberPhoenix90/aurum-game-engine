import { Camera, Label, Stage } from 'aurum-game-engine';
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

setInterval(() => {
	frame.update(frame.value + 1);
	posX.update(posX.value + velX);
	posY.update(posY.value + velY);
});
posX.tap((x) => x > 1240 && (velX *= -1)).tap((x) => x < 10 && (velX *= -1));
posY.tap((y) => y > 440 && (velY *= -1)).tap((y) => y < 10 && (velY *= -1));

Aurum.attach(
	<div>
		<Stage renderPlugin={new PixiJsRenderAdapter()}>
			{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
				<Label
					fontWeight={'bold'}
					fontSize={30}
					color={frame.map(() => `hsl(${(180 / Math.PI) * (v + frame.value / 30)},100%,50%)`)}
					x={posX.map((x) => Math.cos((v + frame.value / 30) * 0.7) * 30 + x)}
					y={posY.map((y) => Math.sin((v + frame.value / 30) * 0.7) * 30 + y)}
				>
					{v}
				</Label>
			))}
			{/* <Sprite tint={'#FF00FF'} x={joy.map((j) => j.x * 320 + 320)} y={joy.map((j) => j.y * 240 + 240)} texture={'images.jpg'}></Sprite> */}
			<Camera screenWidth={1280} screenHeight={480}>
				<Label>Camera A</Label>
			</Camera>
		</Stage>
	</div>,
	document.body
);
