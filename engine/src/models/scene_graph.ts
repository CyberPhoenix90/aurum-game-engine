import { CommonEntity, RenderableType } from './entities';
import { CancellationToken } from 'aurumjs';
import { EntityRenderModel } from '../rendering/model';

export interface SceneGraphNode<T extends CommonEntity> {
	model: T;
	uid?: number;
	cancellationToken: CancellationToken;
	children?: SceneGraphNode<CommonEntity>[];
	nodeType: RenderableType;
	onAttach?(node: SceneGraphNode<T>, renderModel: EntityRenderModel): void;
	onDetach?(node: SceneGraphNode<T>, renderModel: EntityRenderModel): void;
}
