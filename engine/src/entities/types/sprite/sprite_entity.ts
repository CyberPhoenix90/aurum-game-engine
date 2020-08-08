import { Data } from '../../../models/input_data';
import { CommonEntityProps } from '../../../models/entities';
import { SpriteGraphNode } from './api';
import { normalizeComponents, propsToModel } from '../../shared';
import { entityDefaults } from '../../entity_defaults';
import { ArrayDataSource, DataSource } from 'aurumjs';
import { toSourceIfDefined } from '../../../utilities/data/to_source';

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

	onAttach?(node: SpriteGraphNode): void;
	onDetach?(node: SpriteGraphNode): void;
}

export function Sprite(props: SpriteEntityProps): SpriteGraphNode {
	return new SpriteGraphNode({
		name: props.name ?? SpriteGraphNode.name,
		components: normalizeComponents(props.components),
		children: undefined,
		models: {
			coreDefault: entityDefaults,
			appliedStyleClasses: new ArrayDataSource(),
			entityTypeDefault: {
				width: new DataSource('auto'),
				height: new DataSource('auto'),
				tint: new DataSource(undefined),
				drawDistanceX: new DataSource(undefined),
				drawDistanceY: new DataSource(undefined),
				drawOffsetX: new DataSource(undefined),
				drawOffsetY: new DataSource(undefined)
			},
			userSpecified: {
				...propsToModel(props),
				texture: toSourceIfDefined(props.texture),
				drawDistanceX: toSourceIfDefined(props.drawDistanceX),
				drawDistanceY: toSourceIfDefined(props.drawDistanceY),
				drawOffsetX: toSourceIfDefined(props.drawOffsetX),
				drawOffsetY: toSourceIfDefined(props.drawOffsetY),
				tint: toSourceIfDefined(props.tint)
			}
		},
		onAttach: props.onAttach,
		onDetach: props.onDetach
	});
}
