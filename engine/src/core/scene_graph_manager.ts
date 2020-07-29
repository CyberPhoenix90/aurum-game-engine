import { ArrayDataSource, CancellationToken, createRenderSession, DataSource, render, Renderable } from 'aurumjs';
import { AbstractRenderPlugin } from '../aurum_game_engine';
import { CommonEntity } from '../models/entities';
import { SceneGraphNode } from '../models/scene_graph';

export function synchronizeWithRenderPlugin(renderPlugin: AbstractRenderPlugin, stageId: number, nodes: ReadonlyArray<SceneGraphNode<CommonEntity>>) {
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];

		if (node instanceof ArrayDataSource) {
			handleArraySource(node, renderPlugin, stageId);
		} else if (node instanceof DataSource) {
			handleDataSource(node, renderPlugin, stageId);
		} else {
			handleStaticNode(node, renderPlugin, stageId);
		}
	}
}

function handleStaticNode(node: SceneGraphNode<CommonEntity>, renderPlugin: AbstractRenderPlugin, stageId: number): void {
	const children = node.children;
	node.cancellationToken.addCancelable(() => {
		renderPlugin.removeNode(node.uid, stageId);
	});
	renderPlugin.addNode(node, stageId);

	if (children) {
		synchronizeWithRenderPlugin(renderPlugin, stageId, children.getData());
	}
}

function handleDataSource(node: SceneGraphNode<CommonEntity> & DataSource<any>, renderPlugin: AbstractRenderPlugin, stageId: number) {
	let cleanUp: CancellationToken;
	node.listenAndRepeat((v) => {
		if (cleanUp) {
			cleanUp.cancel();
		}
		cleanUp = new CancellationToken();
		const rs = createRenderSession();
		const subNodes = render(v, rs);
		for (const n of subNodes) {
			if (n.cancellationToken) {
				cleanUp.chain(n.cancellationToken);
			}
		}
		synchronizeWithRenderPlugin(renderPlugin, stageId, subNodes);
		rs.attachCalls.forEach((cb) => cb());
		cleanUp.chain(rs.sessionToken);
	});
}

const dynamicRenderKeys = new Map<Renderable, CancellationToken>();

function handleArraySource(node: SceneGraphNode<CommonEntity> & ArrayDataSource<any>, renderPlugin: AbstractRenderPlugin, stageId: number) {
	node.listenAndRepeat((change) => {
		switch (change.operation) {
			case 'add':
				for (const item of change.items) {
					const rs = createRenderSession();
					const node = render(item, rs) as SceneGraphNode<any>;
					dynamicRenderKeys.set(item, node.cancellationToken);
					synchronizeWithRenderPlugin(renderPlugin, stageId, [node]);
					rs.attachCalls.forEach((cb) => cb());
					node.cancellationToken.chain(rs.sessionToken);
				}
				break;
			case 'remove':
				for (const item of change.items) {
					dynamicRenderKeys.get(item).cancel();
				}
				break;
			case 'replace':
				dynamicRenderKeys.get(change.target).cancel();
				const rs = createRenderSession();
				const node = render(change.items[0], rs) as SceneGraphNode<any>;
				rs.attachCalls.forEach((cb) => cb());
				dynamicRenderKeys.set(change.items[0], node.cancellationToken);
				synchronizeWithRenderPlugin(renderPlugin, stageId, [node]);
				break;
		}
	});
}
