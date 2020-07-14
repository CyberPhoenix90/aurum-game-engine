import { Webcomponent, AurumComponentAPI, Aurum, Renderable } from 'aurumjs';
import { SceneGraphNode } from '../models/scene_graph';
import { RenderableType } from '../models/entities';
import { synchronizeWithRenderPlugin } from './scene_graph_manager';
import { AbstractRenderPlugin } from '../rendering/abstract_render_plugin';
import { _ } from '../utilities/other/streamline';
import { EventEmitter } from 'aurumjs';
import { Clock } from '../game_features/time/clock';

export interface StageProps {
	clock?: Clock;
	renderPlugin: AbstractRenderPlugin;
}

const StageComponent = Webcomponent(
	{
		name: 'aurum-stage'
	},
	(props: { renderPlugin: AbstractRenderPlugin; nodes: SceneGraphNode<any>[]; clock: Clock }, api: AurumComponentAPI) => {
		const stageId = _.getUId();
		const cameras = props.nodes.filter((n) => n.nodeType === RenderableType.CAMERA);
		const clock = props.clock;
		let running = true;
		clock.start = () => (running = true);
		clock.stop = () => (running = false);
		return (
			<div
				onAttach={(stageNode) => {
					props.renderPlugin.addStage(stageId, stageNode);
					synchronizeWithRenderPlugin(props.renderPlugin, stageId, props.nodes, undefined, api.prerender.bind(api));
					let lastBefore = clock.timestamp;
					let lastAfter = clock.timestamp;
					let lastTick = Date.now();
					api.cancellationToken.animationLoop(() => {
						let clockDelta = Date.now() - lastTick;
						if (running) {
							clock.update(clockDelta);
						}
						lastTick += clockDelta;
						let delta = clock.timestamp - lastBefore;
						lastBefore += delta;
						onBeforeRender.fire(delta);
						for (const camera of cameras) {
							props.renderPlugin.renderStage(stageId, camera.uid);
						}

						clockDelta = Date.now() - lastTick;
						if (running) {
							clock.update(clockDelta);
						}
						lastTick += clockDelta;
						delta = clock.timestamp - lastAfter;
						lastAfter += delta;
						onAfterRender.fire(delta);
					});
				}}
			></div>
		);
	}
);

export const onBeforeRender: EventEmitter<number> = new EventEmitter();
export const onAfterRender: EventEmitter<number> = new EventEmitter();

export function Stage(props: StageProps, children: Renderable[], api: AurumComponentAPI): Renderable {
	const nodes = api.prerender(children);
	props.clock?.stop();
	return (
		<StageComponent
			clock={
				props.clock ??
				new Clock({
					autoStart: false,
					speed: 1,
					timestamp: 0
				})
			}
			renderPlugin={props.renderPlugin}
			nodes={nodes}
		></StageComponent>
	);
}
