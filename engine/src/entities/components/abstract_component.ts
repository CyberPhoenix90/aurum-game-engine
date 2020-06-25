import { SceneGraphNode } from '../../core/stage';
import { CancellationToken } from 'aurumjs';
import { EntityRenderModel } from '../../rendering/model';

export class AbstractComponent {
	protected cancellationToken: CancellationToken;
	protected owner: SceneGraphNode<any>;
	protected ownerRenderData: EntityRenderModel;

	constructor() {
		this.cancellationToken = new CancellationToken();
	}

	public onAttach(entity: SceneGraphNode<any>, renderData: EntityRenderModel) {
		this.owner = entity;
		this.ownerRenderData = renderData;
	}

	public onDetach() {
		this.owner = undefined;
		this.ownerRenderData = undefined;
	}

	public dispose(): void {
		this.cancellationToken.cancel();
	}
}
