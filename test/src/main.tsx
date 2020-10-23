import { Aurum } from 'aurumjs';
import { Camera, CameraGraphNode, Container, Stage } from 'aurum-game-engine';
import { PixiJsRenderAdapter } from 'aurum-pixijs-renderer';

export let camera: CameraGraphNode;

export function start() {
	Aurum.attach(
		<div>
			<Stage renderPlugin={new PixiJsRenderAdapter()}>
				<Camera
					width={320}
					height={240}
					onAttach={(c) => {
						camera = c;
					}}
				></Camera>
				<Container name="target"></Container>
			</Stage>
		</div>,
		document.body
	);

	mocha.timeout(5000);
	mocha.run();
}
