import { _ } from '../utilities/other/streamline';
import { RenderableType, CommonEntityProps, CommonEntity } from '../models/entities';
import { Data } from '../models/input_data';
import { DataSource, ArrayDataSource, AurumComponentAPI } from 'aurumjs';
import { toSource } from '../utilities/data/to_source';
import { SceneGraphNode } from '../models/scene_graph';

export interface SpriteEntityProps extends CommonEntityProps {
	texture?: Data<string>;
	tint?: Data<string>;
	/**
	 * Offset from the texture at which drawing begins
	 */
	drawOffsetX?: Data<number>;
	drawOffsetY?: Data<number>;
	/**
	 * with and height to draw starting at the source point
	 */
	drawDistanceX?: Data<number>;
	drawDistanceY?: Data<number>;
}

export interface SpriteEntity extends CommonEntity {
	texture: DataSource<string>;
	tint: DataSource<string>;
	/**
	 * Offset from the texture at which drawing begins
	 */
	drawOffsetX: DataSource<number>;
	drawOffsetY: DataSource<number>;
	/**
	 * with and height to draw starting at the source point
	 */
	drawDistanceX: DataSource<number>;
	drawDistanceY: DataSource<number>;
}

export function Sprite(props: SpriteEntityProps, children, api: AurumComponentAPI): SceneGraphNode<SpriteEntity> {
	return {
		cancellationToken: api.cancellationToken,
		model: {
			x: toSource(props.x, 0),
			y: toSource(props.y, 0),
			originX: toSource(props.originX, 0),
			originY: toSource(props.originY, 0),
			minHeight: toSource(props.minHeight, undefined),
			height: toSource(props.height, undefined),
			maxHeight: toSource(props.maxHeight, undefined),
			minWidth: toSource(props.minWidth, undefined),
			width: toSource(props.width, undefined),
			maxWidth: toSource(props.maxWidth, undefined),
			alpha: toSource(props.alpha, 1),
			clip: toSource(props.clip, false),
			marginTop: toSource(props.marginTop, 0),
			marginRight: toSource(props.marginRight, 0),
			marginBottom: toSource(props.marginBottom, 0),
			marginLeft: toSource(props.marginLeft, 0),
			ignoreLayout: toSource(props.ignoreLayout, false),
			spreadLayout: toSource(props.spreadLayout, false),
			components: props.components
				? props.components instanceof ArrayDataSource
					? props.components
					: new ArrayDataSource(props.components)
				: new ArrayDataSource([]),
			name: props.name,
			visible: toSource(props.visible, true),
			zIndex: toSource(props.zIndex, undefined),
			blendMode: toSource(props.blendMode, undefined),
			texture: toSource((props as SpriteEntityProps).texture, undefined),
			tint: toSource((props as SpriteEntityProps).tint, undefined),
			drawOffsetX: toSource((props as SpriteEntityProps).drawOffsetX, undefined),
			drawOffsetY: toSource((props as SpriteEntityProps).drawOffsetY, undefined),
			drawDistanceX: toSource((props as SpriteEntityProps).drawDistanceX, undefined),
			drawDistanceY: toSource((props as SpriteEntityProps).drawDistanceY, undefined)
		},
		uid: _.getUId(),
		nodeType: RenderableType.SPRITE
	};
}
