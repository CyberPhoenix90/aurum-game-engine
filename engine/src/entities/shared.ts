import { ArrayDataSource, MapDataSource } from 'aurumjs';
import { Constructor } from '../models/common';
import { AbstractComponent } from './components/abstract_component';
import { CommonEntityProps, CommonEntity } from '../models/entities';
import { toSourceIfDefined } from '../utilities/data/to_source';

export function getComponentByTypeFactory(components: ArrayDataSource<AbstractComponent>): (type: any) => any {
	return (type: Constructor<any>) => {
		return components.getData().find((c) => Object.getPrototypeOf(c).constructor === type);
	};
}

export function propsToModel(props: CommonEntityProps): CommonEntity {
	return {
		x: toSourceIfDefined(props.x),
		y: toSourceIfDefined(props.y),
		originX: toSourceIfDefined(props.originX),
		originY: toSourceIfDefined(props.originY),
		minHeight: toSourceIfDefined(props.minHeight),
		height: toSourceIfDefined(props.height),
		maxHeight: toSourceIfDefined(props.maxHeight),
		minWidth: toSourceIfDefined(props.minWidth),
		width: toSourceIfDefined(props.width),
		maxWidth: toSourceIfDefined(props.maxWidth),
		scaleX: toSourceIfDefined(props.scaleX),
		scaleY: toSourceIfDefined(props.scaleY),
		alpha: toSourceIfDefined(props.alpha),
		clip: toSourceIfDefined(props.clip),
		marginTop: toSourceIfDefined(props.marginTop),
		marginRight: toSourceIfDefined(props.marginRight),
		marginBottom: toSourceIfDefined(props.marginBottom),
		marginLeft: toSourceIfDefined(props.marginLeft),
		shaders: props.shaders ? (props.shaders instanceof ArrayDataSource ? props.shaders : new ArrayDataSource(props.shaders)) : new ArrayDataSource([]),
		ignoreLayout: toSourceIfDefined(props.ignoreLayout),
		spreadLayout: toSourceIfDefined(props.spreadLayout),
		visible: toSourceIfDefined(props.visible),
		blendMode: toSourceIfDefined(props.blendMode),
		zIndex: toSourceIfDefined(props.zIndex)
	};
}

export function normalizeComponents(
	components: MapDataSource<Constructor<AbstractComponent>, AbstractComponent> | AbstractComponent[]
): MapDataSource<Constructor<AbstractComponent>, AbstractComponent> {
	return components
		? components instanceof MapDataSource
			? components
			: new MapDataSource(new Map(components.map((v) => [Object.getPrototypeOf(v).constructor, v])))
		: new MapDataSource(new Map());
}
