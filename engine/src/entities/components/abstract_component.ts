import { SceneGraphNode } from '../../core/stage';
import { CancellationToken } from 'aurumjs';
import { EntityRenderModel } from '../../rendering/model';
import { CommonEntity } from '../../models/entities';

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
