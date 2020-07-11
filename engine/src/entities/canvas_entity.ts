import { ArrayDataSource, AurumComponentAPI } from 'aurumjs';
import { CommonEntity, CommonEntityProps, RenderableType } from '../models/entities';
import { SceneGraphNode } from '../models/scene_graph';
import { toSource } from '../utilities/data/to_source';
import { _ } from '../utilities/other/streamline';
import { AbstractShape } from '../math/shapes/abstract_shape';
import { CanvasEntityRenderModel } from '../rendering/model';
import { Data } from '../models/input_data';

export interface PaintOperation {
	shape?: AbstractShape;
	strokeStyle?: Data<string>;
	fillStyle?: Data<string>;
	strokeThickness?: Data<number>;
}

export interface CanvasEntityProps extends CommonEntityProps {
	paintOperations: PaintOperation[] | ArrayDataSource<PaintOperation>;
	onAttach?(node: SceneGraphNode<CanvasEntity>, renderModel: CanvasEntityRenderModel): void;
	onDetach?(node: SceneGraphNode<CanvasEntity>, renderModel: CanvasEntityRenderModel): void;
}

export interface CanvasEntity extends CommonEntity {
	paintOperations: ArrayDataSource<PaintOperation>;
}

export function Canvas(props: CanvasEntityProps, children, api: AurumComponentAPI): SceneGraphNode<CanvasEntity> {
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
			scaleX: toSource(props.scaleX, 1),
			scaleY: toSource(props.scaleY, 1),
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
			shaders: props.shaders ? (props.shaders instanceof ArrayDataSource ? props.shaders : new ArrayDataSource(props.shaders)) : new ArrayDataSource([]),
			name: props.name,
			visible: toSource(props.visible, true),
			zIndex: toSource(props.zIndex, undefined),
			blendMode: toSource(props.blendMode, undefined),
			paintOperations: Array.isArray(props.paintOperations) ? new ArrayDataSource(props.paintOperations) : props.paintOperations
		},
		uid: _.getUId(),
		nodeType: RenderableType.CANVAS
	};
}
