import { ArrayDataSource, DataSource, render, Renderable } from 'aurumjs';
import { toSourceIfDefined } from '../../../aurum_game_engine';
import { CommonEntityProps } from '../../../models/entities';
import { Data } from '../../../models/input_data';
import { SceneGraphNode } from '../../../models/scene_graph';
import { entityDefaults } from '../../entity_defaults';
import { normalizeComponents, propsToModel } from '../../shared';
import { CameraGraphNode } from './api';
import { CameraEntity } from './model';

export interface CameraProps extends CommonEntityProps {
	resolutionX?: number;
	resolutionY?: number;
	backgroundColor?: Data<string>;
	onAttach?(node: CameraGraphNode): void;
	onDetach?(node: CameraGraphNode): void;
}

export function Camera(props: CameraProps, children?: Renderable[]): SceneGraphNode<CameraEntity> {
	return new CameraGraphNode({
		name: props.name ?? CameraGraphNode.name,
		components: normalizeComponents(props.components),
		children: new ArrayDataSource(
			render(children, {
				attachCalls: [],
				sessionToken: undefined,
				tokens: []
			})
		),
		models: {
			coreDefault: entityDefaults,
			appliedStyleClasses: new ArrayDataSource(),
			entityTypeDefault: {
				backgroundColor: new DataSource('black')
			},
			userSpecified: {
				...propsToModel(props),
				backgroundColor: toSourceIfDefined(props.backgroundColor),
				resolutionX: toSourceIfDefined(props.resolutionX),
				resolutionY: toSourceIfDefined(props.resolutionY)
			}
		},
		onAttach: props.onAttach,
		onDetach: props.onDetach
	});
}
