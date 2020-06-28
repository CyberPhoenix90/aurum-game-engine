import { Webcomponent, AurumComponentAPI, Aurum, Renderable } from 'aurumjs';
import { SceneGraphNode } from '../models/scene_graph';
import { RenderableType } from '../models/entities';
import { synchronizeWithRenderPlugin } from './scene_graph_manager';
import { AbstractRenderPlugin } from '../rendering/abstract_render_plugin';
import { _ } from '../utilities/other/streamline';
import { EventEmitter } from 'aurumjs/dist/utilities/event_emitter';

export interface StageProps {
	renderPlugin: AbstractRenderPlugin;
}

const StageComponent = Webcomponent(
	{
		name: 'aurum-stage'
	},
	(props: { renderPlugin: AbstractRenderPlugin; nodes: SceneGraphNode<any>[] }, api: AurumComponentAPI) => {
		const stageId = _.getUId();
		const cameras = props.nodes.filter((n) => n.nodeType === RenderableType.CAMERA);

		return (
			<div
				onAttach={(stageNode) => {
					props.renderPlugin.addStage(stageId, stageNode);
					synchronizeWithRenderPlugin(props.renderPlugin, stageId, props.nodes, undefined, api.prerender.bind(api));
					api.cancellationToken.animationLoop(() => {
						onBeforeRender.fire();
						for (const camera of cameras) {
							props.renderPlugin.renderStage(stageId, camera.uid);
						}
						onAfterRender.fire();
					});
				}}
			></div>
		);
	}
);

export const onBeforeRender: EventEmitter<void> = new EventEmitter();
export const onAfterRender: EventEmitter<void> = new EventEmitter();

export function Stage(props: StageProps, children: Renderable[], api: AurumComponentAPI): Renderable {
	const nodes = api.prerender(children);

	return <StageComponent renderPlugin={props.renderPlugin} nodes={nodes}></StageComponent>;
}
