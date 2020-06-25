import { AbstractRenderAdapter, CommonStyleModel, entityDatabase, RenderNode } from 'aurum_game';
import { NoRenderEntity } from './render/no_render_entity';
import { RenderStage } from './render/render_stage';
export class HtmlRenderAdapter extends AbstractRenderAdapter {
	private stages: { [id: number]: RenderStage };

	constructor() {
		super();
		this.stages = {};
	}

	public createRootNode(): HTMLElement {
		return document.createElement('div');
	}

	public resetStyle(): void | Promise<void> {
		throw new Error('Method not implemented.');
	}

	public updateRenderPayload(nodeId: number, renderPayload: any): void | Promise<void> {
		(entityDatabase.getEntityById(nodeId) as NoRenderEntity).updateRenderPayload(renderPayload);
	}

	public renderAction(nodeId: number, renderPayload: any): void | Promise<void> {
		(entityDatabase.getEntityById(nodeId) as NoRenderEntity).renderAction(renderPayload);
	}

	public updateStyle(nodeId: number, styleChanges: Partial<CommonStyleModel>): void | Promise<void> {
		(entityDatabase.getEntityById(nodeId) as NoRenderEntity).updateStyle(styleChanges);
	}

	public renderNode(): void | Promise<void> {
		throw new Error('Method not implemented.');
	}

	public dispose(): void | Promise<void> {
		throw new Error('Method not implemented.');
	}

	public addNode(payload: RenderNode): void | Promise<void> {
		this.stages[payload.stageId].addNode(payload);
	}

	public removeNode(id: number, stageId: number): void | Promise<void> {
		this.stages[stageId].removeNode(id);
	}

	public renderStage(stageId: number, cameraId: number): void | Promise<void> {
		this.stages[stageId].render(cameraId);
	}

	public removeStage(stageId: number): void | Promise<void> {
		throw new Error('Method not implemented.');
	}

	public addStage(stageId: number): void | Promise<void> {
		this.stages[stageId] = new RenderStage(stageId);
	}

	public swapNodes(nodeIdA, nodeIdB) {
		const nodeA = entityDatabase.getEntityById(nodeIdA) as NoRenderEntity;
		const nodeB = entityDatabase.getEntityById(nodeIdB) as NoRenderEntity;
		if (nodeA && nodeB && nodeA.parent === nodeB.parent) {
			const indexA = nodeA.parent.children.indexOf(nodeA);
			const indexB = nodeA.parent.children.indexOf(nodeB);
			nodeA.parent.children[indexA] = nodeB;
			nodeA.parent.children[indexB] = nodeA;
		} else {
			throw new Error(`illegal state: trying to swap 2 nodes that don't have the same parent`);
		}
	}
}
