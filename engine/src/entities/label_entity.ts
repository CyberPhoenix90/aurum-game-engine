import { RenderableType, CommonEntityProps, CommonEntity } from '../models/entities';
import { AurumComponentAPI, Renderable, DataSource, ArrayDataSource } from 'aurumjs';
import { _ } from '../utilities/other/streamline';
import { Data } from '../models/input_data';
import { toSource } from '../utilities/data/to_source';
import { SceneGraphNode } from '../models/scene_graph';
import { LabelEntityRenderModel } from '../rendering/model';

export interface LabelEntityProps extends CommonEntityProps {
	text?: Data<string>;
	renderCharCount?: Data<number>;
	color?: Data<string>;
	stroke?: Data<string>;
	strokeThickness?: Data<number>;
	fontSize?: Data<number>;
	fontStyle?: Data<string>;
	fontWeight?: Data<string>;
	fontFamily?: Data<string>;
	dropShadowDistance?: Data<number>;
	dropShadow?: Data<boolean>;
	dropShadowAngle?: Data<number>;
	dropShadowColor?: Data<string>;
	dropShadowFuzziness?: Data<number>;
	textBaseline?: Data<'top' | 'bottom' | 'hanging' | 'alphabetic' | 'middle'>;
	onAttach?(node: SceneGraphNode<LabelEntity>, renderModel: LabelEntityRenderModel): void;
	onDetach?(node: SceneGraphNode<LabelEntity>, renderModel: LabelEntityRenderModel): void;
}

export interface LabelEntity extends CommonEntity {
	text: DataSource<string>;
	renderCharCount: DataSource<number>;
	color: DataSource<string>;
	stroke: DataSource<string>;
	strokeThickness: DataSource<number>;
	fontSize: DataSource<number>;
	fontStyle: DataSource<string>;
	fontWeight: DataSource<string>;
	fontFamily: DataSource<string>;
	dropShadowDistance: DataSource<number>;
	dropShadow: DataSource<boolean>;
	dropShadowAngle: DataSource<number>;
	dropShadowColor: DataSource<string>;
	dropShadowFuzziness: DataSource<number>;
	textBaseline: DataSource<'top' | 'bottom' | 'hanging' | 'alphabetic' | 'middle'>;
}

export function Label(props: LabelEntityProps, children: Renderable[], api: AurumComponentAPI): SceneGraphNode<LabelEntity> {
	const content = api.prerender(children);
	const text = new DataSource('');

	for (const i of content as Array<string | DataSource<string>>) {
		if (i instanceof DataSource) {
			i.unique().listen((v) => {
				updateText(text, content as any);
			});
		}
	}
	updateText(text, content as any);

	return {
		cancellationToken: api.cancellationToken,
		onAttach: props.onAttach,
		onDetach: props.onDetach,
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
			components: props.components
				? props.components instanceof ArrayDataSource
					? props.components
					: new ArrayDataSource(props.components)
				: new ArrayDataSource([]),
			ignoreLayout: toSource(props.ignoreLayout, false),
			spreadLayout: toSource(props.spreadLayout, false),
			name: props.name,
			text,
			visible: toSource(props.visible, true),
			zIndex: toSource(props.zIndex, undefined),
			blendMode: toSource(props.blendMode, undefined),
			color: toSource(props.color, undefined),
			dropShadowAngle: toSource((props as LabelEntityProps).dropShadowAngle, undefined),
			renderCharCount: toSource((props as LabelEntityProps).renderCharCount, undefined),
			stroke: toSource((props as LabelEntityProps).stroke, undefined),
			strokeThickness: toSource((props as LabelEntityProps).strokeThickness, undefined),
			fontSize: toSource((props as LabelEntityProps).fontSize, undefined),
			fontFamily: toSource((props as LabelEntityProps).fontFamily, undefined),
			fontStyle: toSource((props as LabelEntityProps).fontStyle, undefined),
			fontWeight: toSource((props as LabelEntityProps).fontWeight, undefined),
			dropShadowColor: toSource((props as LabelEntityProps).dropShadowColor, undefined),
			dropShadowDistance: toSource((props as LabelEntityProps).dropShadowDistance, undefined),
			dropShadowFuzziness: toSource((props as LabelEntityProps).dropShadowFuzziness, undefined),
			textBaseline: toSource((props as LabelEntityProps).textBaseline, undefined),
			dropShadow: toSource((props as LabelEntityProps).dropShadow, undefined)
		},
		uid: _.getUId(),
		nodeType: RenderableType.LABEL
	};
}

function updateText(text: DataSource<string>, content: Array<string | DataSource<string>>): void {
	text.update(
		content.reduce<string>((p, c) => {
			if (typeof c === 'string' || typeof c === 'number' || typeof c === 'bigint' || typeof c === 'boolean') {
				return `${p}${c}`;
			} else {
				if (c.value) {
					return `${p}${c.value}`;
				} else {
					return p;
				}
			}
		}, '')
	);
}
