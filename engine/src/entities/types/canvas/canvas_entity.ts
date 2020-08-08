import { ArrayDataSource } from 'aurumjs';
import { CommonEntityProps } from '../../../models/entities';
import { CanvasGraphNode } from './api';
import { AbstractShape } from '../../../math/shapes/abstract_shape';
import { Data } from '../../../models/input_data';
import { normalizeComponents, propsToModel } from '../../shared';
import { entityDefaults } from '../../entity_defaults';

export interface PaintOperation {
	shape?: AbstractShape;
	strokeStyle?: Data<string>;
	fillStyle?: Data<string>;
	strokeThickness?: Data<number>;
}

export interface CanvasEntityProps extends CommonEntityProps {
	paintOperations?: PaintOperation[] | ArrayDataSource<PaintOperation>;
	onAttach?(node: CanvasGraphNode): void;
	onDetach?(node: CanvasGraphNode): void;
}

export function Canvas(props: CanvasEntityProps): CanvasGraphNode {
	return new CanvasGraphNode({
		name: props.name ?? CanvasGraphNode.name,
		components: normalizeComponents(props.components),
		children: undefined,
		models: {
			coreDefault: entityDefaults,
			appliedStyleClasses: new ArrayDataSource(),
			entityTypeDefault: {},
			userSpecified: {
				...propsToModel(props),
				paintOperations: props.paintOperations
					? props.paintOperations instanceof ArrayDataSource
						? props.paintOperations
						: new ArrayDataSource(props.paintOperations)
					: new ArrayDataSource([])
			}
		},
		onAttach: props.onAttach,
		onDetach: props.onDetach
	});
}
