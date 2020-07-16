import { ArrayDataSource, CancellationToken, DataSource, Renderable, createRenderSession, render } from 'aurumjs';
import { AbstractRenderPlugin, LabelEntity, SpriteEntity } from '../aurum_game_engine';
import { CameraEntity } from '../entities/camera';
import { CommonEntity, RenderableType } from '../models/entities';
import { SceneGraphNode } from '../models/scene_graph';
import { CameraEntityRenderModel, EntityRenderModel, LabelEntityRenderModel, SpriteEntityRenderModel, CanvasEntityRenderModel } from '../rendering/model';
import { CanvasEntity } from '../entities/canvas_entity';
import { measureStringWidth } from '../entities/label_entity';
import { TiledMapRenderModel, TiledMapEntity } from '../game_features/tile_maps/tiled/tiled_map_entity';

export function createRenderModel(node: SceneGraphNode<CommonEntity>, parent?: SceneGraphNode<any>, parentRenderModel?: EntityRenderModel): EntityRenderModel {
	const { x, y, sizeX, sizeY } = layoutAlgorithm(node);
	let result;

	switch (node.nodeType) {
		case RenderableType.SPRITE:
			result = {
				parent: parentRenderModel,
				getAbsolutePositionX: undefined,
				getAbsolutePositionY: undefined,
				alpha: node.model.alpha,
				cancellationToken: node.cancellationToken,
				clip: node.model.clip,
				name: node.model.name,
				parentUid: parent?.uid,
				positionX: x,
				positionY: y,
				sizeX: sizeX,
				sizeY: sizeY,
				scaleX: node.model.scaleX,
				scaleY: node.model.scaleY,
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
				drawDistanceY: (node.model as SpriteEntity).drawDistanceY,
				shader: node.model.shaders
			} as SpriteEntityRenderModel;
			break;
		case RenderableType.CANVAS:
			result = {
				parent: parentRenderModel,
				getAbsolutePositionX: undefined,
				getAbsolutePositionY: undefined,
				alpha: node.model.alpha,
				cancellationToken: node.cancellationToken,
				clip: node.model.clip,
				name: node.model.name,
				parentUid: parent?.uid,
				positionX: x,
				positionY: y,
				sizeX: sizeX,
				sizeY: sizeY,
				scaleX: node.model.scaleX,
				scaleY: node.model.scaleY,
				renderableType: node.nodeType,
				uid: node.uid,
				visible: node.model.visible,
				zIndex: node.model.zIndex,
				blendMode: node.model.blendMode,
				painerOperations: (node.model as CanvasEntity).paintOperations,
				shader: node.model.shaders
			} as CanvasEntityRenderModel;
			break;
		case RenderableType.CAMERA:
			result = {
				parent: parentRenderModel,
				getAbsolutePositionX: undefined,
				getAbsolutePositionY: undefined,
				view: undefined,
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
				scaleX: node.model.scaleX,
				scaleY: node.model.scaleY,
				visible: node.model.visible,
				zIndex: node.model.zIndex,
				blendMode: node.model.blendMode,
				backgroundColor: (node.model as CameraEntity).backgroundColor,
				shader: node.model.shaders
			} as CameraEntityRenderModel;
			break;
		case RenderableType.LABEL:
			result = {
				parent: parentRenderModel,
				getAbsolutePositionX: undefined,
				getAbsolutePositionY: undefined,
				alpha: node.model.alpha,
				cancellationToken: node.cancellationToken,
				clip: node.model.clip,
				name: node.model.name,
				parentUid: parent?.uid,
				renderableType: node.nodeType,
				uid: node.uid,
				positionX: x,
				positionY: y,
				sizeX,
				sizeY,
				scaleX: node.model.scaleX,
				scaleY: node.model.scaleY,
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
				dropShadow: (node.model as LabelEntity).dropShadow,
				shader: node.model.shaders
			} as LabelEntityRenderModel;
			break;
		case RenderableType.NO_RENDER:
			result = {
				parent: parentRenderModel,
				getAbsolutePositionX: undefined,
				getAbsolutePositionY: undefined,
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
				scaleX: node.model.scaleX,
				scaleY: node.model.scaleY,
				visible: node.model.visible,
				zIndex: node.model.zIndex,
				blendMode: node.model.blendMode,
				shader: node.model.shaders
			} as EntityRenderModel;
			break;
		case RenderableType.TILE_MAP:
			result = {
				parent: parentRenderModel,
				getAbsolutePositionX: undefined,
				getAbsolutePositionY: undefined,
				layers: (node.model as TiledMapEntity).layers,
				mapData: (node.model as TiledMapEntity).mapData,
				tilesets: (node.model as TiledMapEntity).tilesets,
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
				scaleX: node.model.scaleX,
				scaleY: node.model.scaleY,
				visible: node.model.visible,
				zIndex: node.model.zIndex,
				blendMode: node.model.blendMode,
				shader: node.model.shaders
			} as TiledMapRenderModel;
			break;
	}

	result.getAbsolutePositionX = getAbsolutePositionX.bind(result);
	result.getAbsolutePositionY = getAbsolutePositionY.bind(result);
	return result;
}

function getAbsolutePositionX(this: EntityRenderModel) {
	let x = this.positionX.value;
	let ptr = this.parent;
	while (ptr) {
		x += ptr.positionX.value;
		ptr = ptr.parent;
	}
	return x;
}
function getAbsolutePositionY(this: EntityRenderModel) {
	let y = this.positionY.value;
	let ptr = this.parent;
	while (ptr) {
		y += ptr.positionY.value;
		ptr = ptr.parent;
	}
	return y;
}
interface LayoutData {
	x: DataSource<number>;
	y: DataSource<number>;
	sizeX: DataSource<number>;
	sizeY: DataSource<number>;
}

function layoutAlgorithm(node: SceneGraphNode<CommonEntity>): LayoutData {
	let sizeX: DataSource<number>;
	let sizeY: DataSource<number>;

	if (node.nodeType === RenderableType.LABEL) {
		sizeX = node.model.width.aggregateFour(
			(node.model as LabelEntity).text,
			(node.model as LabelEntity).fontSize,
			(node.model as LabelEntity).fontFamily,
			(size, text, fs, ff) =>
				size === undefined ? measureStringWidth(text, (node.model as LabelEntity).fontWeight.value, fs, ff) : parseInt(size.toString())
		);
		sizeY = node.model.height.map((v) => (v === undefined ? undefined : parseInt(v.toString())));
	} else {
		sizeX = node.model.width.map((v) => (v === undefined ? undefined : parseInt(v.toString())));
		sizeY = node.model.height.map((v) => (v === undefined ? undefined : parseInt(v.toString())));
	}

	const result: LayoutData = {
		x: node.model.x.map((v) => {
			return parseInt(v.toString()) - node.model.originX.value * (sizeX.value ?? 0) * node.model.scaleX.value;
		}),
		y: node.model.y.map((v) => {
			return parseInt(v.toString()) - node.model.originY.value * (sizeY.value ?? 0) * node.model.scaleY.value;
		}),
		sizeX,
		sizeY
	};

	return result;
}

export function synchronizeWithRenderPlugin(
	renderPlugin: AbstractRenderPlugin,
	stageId: number,
	nodes: SceneGraphNode<CommonEntity>[],
	parent: SceneGraphNode<any>,
	parentRenderModel: EntityRenderModel,
	prerender: (renderable: Renderable[]) => SceneGraphNode<any>[]
) {
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];

		if (node instanceof ArrayDataSource) {
			handleArraySource(node, renderPlugin, stageId, prerender, parent, parentRenderModel);
		} else if (node instanceof DataSource) {
			handleDataSource(node, prerender, renderPlugin, stageId, parent, parentRenderModel);
		} else {
			handleStaticNode(node, parent, parentRenderModel, renderPlugin, stageId, prerender);
		}
	}
}

function handleStaticNode(
	node: SceneGraphNode<CommonEntity>,
	parent: SceneGraphNode<any>,
	parentRenderModel: EntityRenderModel,
	renderPlugin: AbstractRenderPlugin,
	stageId: number,
	prerender: (renderable: Renderable[]) => SceneGraphNode<any>[]
): void {
	const children = node.children;
	const renderData = createRenderModel(node, parent, parentRenderModel);
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
		synchronizeWithRenderPlugin(renderPlugin, stageId, children, node, renderData, prerender);
	}
}

function handleDataSource(
	node: SceneGraphNode<CommonEntity> & DataSource<any>,
	prerender: (renderable: Renderable[]) => SceneGraphNode<any>[],
	renderPlugin: AbstractRenderPlugin,
	stageId: number,
	parent: SceneGraphNode<any>,
	parentRenderModel: EntityRenderModel
) {
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
		synchronizeWithRenderPlugin(renderPlugin, stageId, subNodes, parent, parentRenderModel, prerender);
		rs.attachCalls.forEach((cb) => cb());
		cleanUp.chain(rs.sessionToken);
	});
}

const dynamicRenderKeys = new Map<Renderable, CancellationToken>();

function handleArraySource(
	node: SceneGraphNode<CommonEntity> & ArrayDataSource<any>,
	renderPlugin: AbstractRenderPlugin,
	stageId: number,
	prerender: (renderable: Renderable[]) => SceneGraphNode<any>[],
	parent: SceneGraphNode<any>,
	parentRenderModel: EntityRenderModel
) {
	node.listenAndRepeat((change) => {
		switch (change.operation) {
			case 'add':
				for (const item of change.items) {
					const rs = createRenderSession();
					const node = (render(item, rs) as any) as SceneGraphNode<any>;
					dynamicRenderKeys.set(item, node.cancellationToken);
					synchronizeWithRenderPlugin(renderPlugin, stageId, [node], parent, parentRenderModel, prerender);
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
				const node = (prerender(change.items[0]) as any) as SceneGraphNode<any>;
				dynamicRenderKeys.set(change.items[0], node.cancellationToken);
				synchronizeWithRenderPlugin(renderPlugin, stageId, [node], parent, parentRenderModel, prerender);
				break;
		}
	});
}
