import { Aurum, AurumComponentAPI, CancellationToken, DataSource, Renderable, Webcomponent } from 'aurumjs';
import { CommonEntity, CommonEntityProps, RenderableType } from '../models/entities';
import { SpriteEntity } from '../entities/sprite_entity';
import { AbstractRenderPlugin } from '../rendering/abstract_render_plugin';
import { CameraEntityRenderModel, EntityRenderModel, LabelEntityRenderModel, SpriteEntityRenderModel } from '../rendering/model';
import { _ } from '../utilities/other/streamline';
import { LabelEntity } from '../entities/label_entity';
import { CameraEntity } from '../entities/camera';

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
					bind(props.renderPlugin, stageId, props.nodes, undefined);
					api.cancellationToken.animationLoop(() => {
						for (const camera of cameras) {
							props.renderPlugin.renderStage(stageId, camera.uid);
						}
					});
				}}
			></div>
		);
	}
);

export function Stage(props: StageProps, children: Renderable[], api: AurumComponentAPI): Renderable {
	const nodes = api.prerender(children);

	return <StageComponent renderPlugin={props.renderPlugin} nodes={nodes}></StageComponent>;
}

export interface SceneGraphNode<T extends CommonEntityProps> {
	model: T;
	uid?: number;
	children?: SceneGraphNode<any>[];
	nodeType: RenderableType;
}

function bind(renderPlugin: AbstractRenderPlugin, stageId: number, nodes: SceneGraphNode<any>[], parent: SceneGraphNode<any>) {
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		const children = node.children;
		const renderData = render(node, parent);
		renderPlugin.addNode(renderData, i, stageId);
		if (children) {
			bind(renderPlugin, stageId, children, node);
		}
	}
}

function render(node: SceneGraphNode<CommonEntity>, parent?: SceneGraphNode<any>): EntityRenderModel {
	const { x, y, sizeX, sizeY } = layoutAlgorithm(node);

	switch (node.nodeType) {
		case RenderableType.SPRITE:
			return {
				alpha: node.model.alpha,
				cancellationToken: new CancellationToken(),
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
				cancellationToken: new CancellationToken(),
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
				cancellationToken: new CancellationToken(),
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
				cancellationToken: new CancellationToken(),
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
