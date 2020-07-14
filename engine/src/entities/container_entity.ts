import { AurumComponentAPI, Renderable, ArrayDataSource } from 'aurumjs';
import { _ } from '../utilities/other/streamline';
import { RenderableType, CommonEntityProps, CommonEntity } from '../models/entities';
import { toSource } from '../utilities/data/to_source';
import { SceneGraphNode } from '../models/scene_graph';
import { getComponentByTypeFactory } from './shared';

export interface ContainerEntityProps extends CommonEntityProps {}

export interface ContainerEntity extends CommonEntity {}

export function Container(props: ContainerEntityProps, children: Renderable[], api: AurumComponentAPI): SceneGraphNode<ContainerEntity> {
	const content = api.prerender(children);
	const components = props.components
		? props.components instanceof ArrayDataSource
			? props.components
			: new ArrayDataSource(props.components)
		: new ArrayDataSource([]);

	return {
		cancellationToken: api.cancellationToken,
		onAttach: props.onAttach,
		onDetach: props.onDetach,
		model: {
			getComponentByType: getComponentByTypeFactory(components),
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
			scaleX: toSource(props.scaleX, 1),
			scaleY: toSource(props.scaleY, 1),
			alpha: toSource(props.alpha, 1),
			clip: toSource(props.clip, false),
			marginTop: toSource(props.marginTop, 0),
			marginRight: toSource(props.marginRight, 0),
			marginBottom: toSource(props.marginBottom, 0),
			marginLeft: toSource(props.marginLeft, 0),
			components,
			shaders: props.shaders ? (props.shaders instanceof ArrayDataSource ? props.shaders : new ArrayDataSource(props.shaders)) : new ArrayDataSource([]),
			ignoreLayout: toSource(props.ignoreLayout, false),
			spreadLayout: toSource(props.spreadLayout, false),
			name: props.name,
			visible: toSource(props.visible, true),
			blendMode: toSource(props.blendMode, undefined),
			zIndex: toSource(props.zIndex, undefined)
		},
		children: content,
		uid: _.getUId(),
		nodeType: RenderableType.NO_RENDER
	};
}
