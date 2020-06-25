import { NoRenderEntity } from './pixi_no_render_entity';
import { CameraEntityRenderModel, Color } from 'aurum-game-engine';
import { autoDetectRenderer, DisplayObject } from 'pixi.js';

export class RenderCameraEntity extends NoRenderEntity {
	private readonly renderer: PIXI.Renderer;
	private readonly model: CameraEntityRenderModel;

	constructor(model: CameraEntityRenderModel, stageNode: HTMLElement) {
		super(model);
		this.model = model;
		const view: HTMLCanvasElement = document.createElement('canvas');
		view.width = model.sizeX.value;
		view.height = model.sizeY.value;
		stageNode.appendChild(view);

		this.renderer = autoDetectRenderer({
			view: view,
			backgroundColor: Color.fromString(model.backgroundColor.value || '#000000').toRGBNumber()
		});
	}

	public renderView(node: DisplayObject) {
		if (this.renderer.view.width !== this.model.sizeX.value || this.renderer.view.height !== this.model.sizeY.value) {
			this.renderer.resize(this.model.sizeX.value, this.model.sizeY.value);
		}
		this.renderer.render(node);
	}
}
