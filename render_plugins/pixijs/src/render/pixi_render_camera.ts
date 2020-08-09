import { CameraGraphNode, Color } from 'aurum-game-engine';
import { autoDetectRenderer, DisplayObject } from 'pixi.js';
import { NoRenderEntity } from './pixi_no_render_entity';

export class RenderCameraEntity extends NoRenderEntity {
	private readonly renderer: PIXI.Renderer;
	private view: HTMLCanvasElement;

	constructor(model: CameraGraphNode, stageNode: HTMLElement) {
		super(model);
		this.model = model;
		const view: HTMLCanvasElement = document.createElement('canvas');
		model.renderState.view = view;
		view.width = model.renderState.sizeX.value;
		view.height = model.renderState.sizeY.value;
		stageNode.appendChild(view);

		this.renderer = autoDetectRenderer({
			view: view,
			backgroundColor: Color.fromString(model.renderState.backgroundColor.value || '#000000').toRGBNumber()
		});

		this.view = view;
	}

	public renderView(node: DisplayObject) {
		//@ts-ignore
		this.view.node = node;
		if (this.renderer.view.width !== this.model.renderState.sizeX.value || this.renderer.view.height !== this.model.renderState.sizeY.value) {
			this.renderer.resize(this.model.renderState.sizeX.value, this.model.renderState.sizeY.value);
		}
		this.renderer.render(node);
	}
}
