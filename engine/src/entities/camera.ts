import { RenderableType, CommonEntityProps, CommonEntity } from '../models/entities';
import { _ } from '../utilities/other/streamline';
import { Renderable, AurumComponentAPI, DataSource, ArrayDataSource } from 'aurumjs';
import { Data } from '../models/input_data';
import { toSource } from '../utilities/data/to_source';
import { SceneGraphNode } from '../models/scene_graph';
import { PointLike } from '../models/point';
import { CameraEntityRenderModel } from '../rendering/model';

export interface CameraProps extends CommonEntityProps {
	screenWidth: number;
	screenHeight: number;
	resolutionX?: number;
	resolutionY?: number;
	backgroundColor?: Data<string>;
	onAttach?(node: SceneGraphNode<CameraEntity>, renderModel: CameraEntityRenderModel): void;
	onDetach?(node: SceneGraphNode<CameraEntity>, renderModel: CameraEntityRenderModel): void;
}

export interface CameraEntity extends CommonEntity {
	projectMouseCoordinates(e: MouseEvent): PointLike;
	projectPoint(e: PointLike): PointLike;
	backgroundColor: DataSource<string>;
}

export function Camera(props: CameraProps, children: Renderable[], api: AurumComponentAPI): SceneGraphNode<CameraEntity> {
	let cameraRenderModel: CameraEntityRenderModel;

	const result = {
		cancellationToken: api.cancellationToken,
		onAttach: (entity, entityRenderModel) => {
			cameraRenderModel = entityRenderModel as CameraEntityRenderModel;
			props.onAttach(entity, entityRenderModel as CameraEntityRenderModel);
		},
		onDetach: props.onDetach,
		model: {
			projectMouseCoordinates: (e: MouseEvent) => {
				return result.model.projectPoint({
					x: e.clientX,
					y: e.clientY
				});
			},
			projectPoint(point: PointLike): PointLike {
				const rect = cameraRenderModel.view.getBoundingClientRect();
				return {
					x:
						((point.x - rect.left + cameraRenderModel.positionX.value) * cameraRenderModel.sizeX.value) /
						(props.resolutionX || cameraRenderModel.sizeX.value),
					y:
						((point.y - rect.top + cameraRenderModel.positionY.value) * cameraRenderModel.sizeY.value) /
						(props.resolutionY || cameraRenderModel.sizeY.value)
				};
			},
			x: toSource(props.x, 0),
			y: toSource(props.y, 0),
			originX: toSource(props.originX, 0),
			originY: toSource(props.originY, 0),
			minHeight: toSource(props.minHeight, 0),
			height: toSource(props.screenHeight, 0),
			maxHeight: toSource(props.maxHeight, 0),
			minWidth: toSource(props.minWidth, 0),
			width: toSource(props.screenWidth, 0),
			maxWidth: toSource(props.maxWidth, 0),
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
			backgroundColor: toSource(props.backgroundColor, 'black'),
			ignoreLayout: toSource(props.ignoreLayout, false),
			spreadLayout: toSource(props.spreadLayout, false),
			name: props.name,
			visible: toSource(props.visible, true),
			blendMode: toSource(props.blendMode, undefined),
			zIndex: toSource(props.zIndex, undefined)
		},
		children: api.prerender(children),
		nodeType: RenderableType.CAMERA,
		uid: _.getUId()
	};
	return result;
}
