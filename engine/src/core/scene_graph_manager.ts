import { ArrayDataSource, CancellationToken, DataSource, Renderable } from 'aurumjs';
import { AbstractRenderPlugin, LabelEntity, SpriteEntity } from '../aurum_game_engine';
import { CameraEntity } from '../entities/camera';
import { CommonEntity, RenderableType } from '../models/entities';
import { SceneGraphNode } from '../models/scene_graph';
import { CameraEntityRenderModel, EntityRenderModel, LabelEntityRenderModel, SpriteEntityRenderModel } from '../rendering/model';

export function createRenderModel(node: SceneGraphNode<CommonEntity>, parent?: SceneGraphNode<any>): EntityRenderModel {
	const { x, y, sizeX, sizeY } = layoutAlgorithm(node);

	switch (node.nodeType) {
		case RenderableType.SPRITE:
			return {
				alpha: node.model.alpha,
				cancellationToken: node.cancellationToken,
				clip: node.model.clip,
				name: node.model.name,
				parentUid: parent?.uid,
				positionX: x,
				positionY: y,
				sizeX: sizeX,
				sizeY: sizeY,
				renderableType: node.nodeType,
				uid: node.uid,
				visible: node.model.visible,
				zIndex: node.model.zIndex,
				blendMode: node.model.blendMode,
				texture: (node.model as SpriteEntity).texture,
				tint: (node.model as SpriteEntity).tint,
				drawOffsetX: (node.model as SpriteEntity).drawOffsetX,
				drawOffsetY: (node.model as SpriteEntity).drawOffsetY,
				drawDistanceX: (node.model as SpriteEntity).drawDistanceX,
				drawDistanceY: (node.model as SpriteEntity).drawDistanceY
			} as SpriteEntityRenderModel;
		case RenderableType.CAMERA:
			return {
				alpha: node.model.alpha,
				cancellationToken: node.cancellationToken,
				clip: node.model.clip,
				name: node.model.name,
				parentUid: parent?.uid,
				renderableType: node.nodeType,
				uid: node.uid,
				positionX: x,
				positionY: y,
				sizeX: sizeX,
				sizeY: sizeY,
				visible: node.model.visible,
				zIndex: node.model.zIndex,
				blendMode: node.model.blendMode,
				backgroundColor: (node.model as CameraEntity).backgroundColor
			} as CameraEntityRenderModel;
		case RenderableType.LABEL:
			return {
				alpha: node.model.alpha,
				cancellationToken: node.cancellationToken,
				clip: node.model.clip,
				name: node.model.name,
				parentUid: parent?.uid,
				renderableType: node.nodeType,
				uid: node.uid,
				positionX: x,
				positionY: y,
				sizeX: sizeX,
				sizeY: sizeY,
				visible: node.model.visible,
				zIndex: node.model.zIndex,
				blendMode: node.model.blendMode,
				text: (node.model as LabelEntity).text,
				color: (node.model as LabelEntity).color,
				dropShadowAngle: (node.model as LabelEntity).dropShadowAngle,
				renderCharCount: (node.model as LabelEntity).renderCharCount,
				stroke: (node.model as LabelEntity).stroke,
				strokeThickness: (node.model as LabelEntity).strokeThickness,
				fontSize: (node.model as LabelEntity).fontSize,
				fontFamily: (node.model as LabelEntity).fontFamily,
				fontStyle: (node.model as LabelEntity).fontStyle,
				fontWeight: (node.model as LabelEntity).fontWeight,
				dropShadowColor: (node.model as LabelEntity).dropShadowColor,
				dropShadowDistance: (node.model as LabelEntity).dropShadowDistance,
				dropShadowFuzziness: (node.model as LabelEntity).dropShadowFuzziness,
				textBaseline: (node.model as LabelEntity).textBaseline,
				dropShadow: (node.model as LabelEntity).dropShadow
			} as LabelEntityRenderModel;
		case RenderableType.NO_RENDER:
			return {
				alpha: node.model.alpha,
				cancellationToken: node.cancellationToken,
				clip: node.model.clip,
				name: node.model.name,
				parentUid: parent?.uid,
				renderableType: node.nodeType,
				uid: node.uid,
				positionX: x,
				positionY: y,
				sizeX: sizeX,
				sizeY: sizeY,
				visible: node.model.visible,
				zIndex: node.model.zIndex,
				blendMode: node.model.blendMode
			} as EntityRenderModel;
	}
}

function layoutAlgorithm(
	node: SceneGraphNode<CommonEntity>
): { x: DataSource<number>; y: DataSource<number>; sizeX: DataSource<number>; sizeY: DataSource<number> } {
	return {
		x: node.model.x.map((v) => parseInt(v.toString())),
		y: node.model.y.map((v) => parseInt(v.toString())),
		sizeX: node.model.width.map((v) => (v === undefined ? undefined : parseInt(v.toString()))),
		sizeY: node.model.height.map((v) => (v === undefined ? undefined : parseInt(v.toString())))
	};
}

export function synchronizeWithRenderPlugin(
	renderPlugin: AbstractRenderPlugin,
	stageId: number,
	nodes: SceneGraphNode<CommonEntity>[],
	parent: SceneGraphNode<any>,
	prerender: (renderable: Renderable[]) => SceneGraphNode<any>[]
) {
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];

		if (node instanceof ArrayDataSource) {
			handleArraySource(node, renderPlugin, stageId, prerender, parent);
		} else if (node instanceof DataSource) {
			handleDataSource(node, prerender, renderPlugin, stageId, parent);
		} else {
			handleStaticNode(node, parent, renderPlugin, stageId, prerender);
		}
	}
}

function handleStaticNode(
	node: SceneGraphNode<CommonEntity>,
	parent: SceneGraphNode<any>,
	renderPlugin: AbstractRenderPlugin,
	stageId: number,
	prerender: (renderable: Renderable[]) => SceneGraphNode<any>[]
): void {
	const children = node.children;
	const renderData = createRenderModel(node, parent);
	renderData.cancellationToken.addCancelable(() => {
		renderPlugin.removeNode(renderData.uid, stageId);
		node.onDetach?.(node, renderData);
	});
	renderPlugin.addNode(renderData, stageId);
	node.onAttach?.(node, renderData);
	node.model.components.listenAndRepeat((change) => {
		switch (change.operation) {
			case 'add':
				for (const item of change.items) {
					item.onAttach(node, renderData);
				}
				break;
			case 'remove':
				for (const item of change.items) {
					item.onDetach();
				}
				break;
			case 'replace':
				change.target.onDetach();
				for (const item of change.items) {
					item.onAttach(node, renderData);
				}
				break;
			case 'merge':
				for (const item of change.previousState) {
					item.onDetach();
				}
				for (const item of change.items) {
					item.onAttach(node, renderData);
				}
				break;
		}
	}, renderData.cancellationToken);
	if (children) {
		synchronizeWithRenderPlugin(renderPlugin, stageId, children, node, prerender);
	}
}

function handleDataSource(
	node: SceneGraphNode<CommonEntity> & DataSource<any>,
	prerender: (renderable: Renderable[]) => SceneGraphNode<any>[],
	renderPlugin: AbstractRenderPlugin,
	stageId: number,
	parent: SceneGraphNode<any>
) {
	let cleanUp: CancellationToken;
	node.listenAndRepeat((v) => {
		if (cleanUp) {
			cleanUp.cancel();
		}
		cleanUp = new CancellationToken();
		const subNodes = prerender(v);
		for (const n of subNodes) {
			if (n.cancellationToken) {
				cleanUp.chain(n.cancellationToken);
			}
		}
		synchronizeWithRenderPlugin(renderPlugin, stageId, subNodes, parent, prerender);
	});
}

const dynamicRenderKeys = new Map<Renderable, CancellationToken>();

function handleArraySource(
	node: SceneGraphNode<CommonEntity> & ArrayDataSource<any>,
	renderPlugin: AbstractRenderPlugin,
	stageId: number,
	prerender: (renderable: Renderable[]) => SceneGraphNode<any>[],
	parent: SceneGraphNode<any>
) {
	node.listenAndRepeat((change) => {
		switch (change.operation) {
			case 'add':
				for (const item of change.items) {
					const node = (prerender(item) as any) as SceneGraphNode<any>;
					dynamicRenderKeys.set(item, node.cancellationToken);
					synchronizeWithRenderPlugin(renderPlugin, stageId, [node], parent, prerender);
				}
				break;
			case 'remove':
				for (const item of change.items) {
					dynamicRenderKeys.get(item).cancel();
				}
				break;
			case 'replace':
				dynamicRenderKeys.get(change.target).cancel();
				const node = (prerender(change.items[0]) as any) as SceneGraphNode<any>;
				dynamicRenderKeys.set(change.items[0], node.cancellationToken);
				synchronizeWithRenderPlugin(renderPlugin, stageId, [node], parent, prerender);
				break;
		}
	});
}
