import { CancellationToken } from 'aurumjs';
import { EntityRenderModel } from '../../rendering/model';
import { CommonEntity } from '../../models/entities';
import { SceneGraphNode } from '../../models/scene_graph';

export class AbstractComponent {
	protected cancellationToken: CancellationToken;

	constructor() {
		this.cancellationToken = new CancellationToken();
	}

	public onAttach(entity: SceneGraphNode<CommonEntity>, renderData: EntityRenderModel) {}

	public onDetach() {}

	public dispose(): void {
		this.cancellationToken.cancel();
	}
}
