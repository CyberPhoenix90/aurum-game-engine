import { ArrayDataSource, AurumComponentAPI, Renderable, DataSource } from 'aurumjs';
import { CommonEntityProps } from '../../../models/entities';
import { entityDefaults } from '../../entity_defaults';
import { normalizeComponents, propsToModel } from '../../shared';
import { CanvasGraphNode } from '../canvas/api';
import { ContainerGraphNode } from './api';

export interface ContainerEntityProps extends CommonEntityProps {}

export function Container(props: ContainerEntityProps, children: Renderable[], api: AurumComponentAPI): ContainerGraphNode {
	const content = api.prerender(children);
	return new ContainerGraphNode({
		name: props.name ?? CanvasGraphNode.name,
		components: normalizeComponents(props.components),
		children: new ArrayDataSource(content),
		models: {
			coreDefault: entityDefaults,
			appliedStyleClasses: new ArrayDataSource(),
			entityTypeDefault: {
				width: new DataSource('content'),
				height: new DataSource('content')
			},
			userSpecified: {
				...propsToModel(props)
			}
		},
		onAttach: props.onAttach,
		onDetach: props.onDetach
	});
}
