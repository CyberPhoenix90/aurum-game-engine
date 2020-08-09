import { ArrayDataSource, AurumComponentAPI, DataSource, Renderable } from 'aurumjs';
import { CommonEntityProps, CommonEntity } from '../../../models/entities';
import { ContainerGraphNode } from '../../../models/scene_graph';
import { entityDefaults } from '../../entity_defaults';
import { normalizeComponents, propsToModel } from '../../shared';
import { ContainerEntity } from './model';

export interface ContainerEntityProps extends CommonEntityProps {
	onAttach?(node: ContainerGraphNode): void;
	onDetach?(node: ContainerGraphNode): void;
	class?: CommonEntity[] | ArrayDataSource<CommonEntity>;
}

export function Container(props: ContainerEntityProps, children: Renderable[], api: AurumComponentAPI): ContainerGraphNode {
	const content = api.prerender(children);
	return new ContainerGraphNode({
		name: props.name ?? ContainerGraphNode.name,
		components: normalizeComponents(props.components),
		children: new ArrayDataSource(content),
		models: {
			coreDefault: entityDefaults,
			appliedStyleClasses: props.class instanceof ArrayDataSource ? props.class : new ArrayDataSource(props.class),
			entityTypeDefault: containerDefaultModel,
			userSpecified: {
				...propsToModel(props)
			}
		},
		onAttach: props.onAttach,
		onDetach: props.onDetach
	});
}

export const containerDefaultModel: ContainerEntity = {
	width: new DataSource('content'),
	height: new DataSource('content')
};
