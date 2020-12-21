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
		view.width = model.resolvedModel.resolutionX.value ?? model.renderState.sizeX.value;
		view.height = model.resolvedModel.resolutionY.value ?? model.renderState.sizeY.value;
		stageNode.appendChild(view);

		this.renderer = autoDetectRenderer({
			view: view,
			backgroundColor: Color.fromString(model.renderState.backgroundColor.value || '#000000').toRGBNumber()
		});

		this.view = view;

		const { resolutionX, resolutionY } = model.resolvedModel;
		resolutionX.aggregate([resolutionY, model.renderState.sizeX, model.renderState.sizeY], (resolutionX, resolutionY, sizeX, sizeY) => {
			const effectiveSizeX = resolutionX ?? sizeX;
			const effectiveSizeY = resolutionY ?? sizeY;

			if (this.renderer.view.width !== effectiveSizeX || this.renderer.view.height !== effectiveSizeY) {
				this.renderer.resize(effectiveSizeX, effectiveSizeY);
			}
			this.renderer.view.style.width = `${sizeX}px`;
			this.renderer.view.style.height = `${sizeY}px`;
		});
		this.renderer.view.style.width = `${model.renderState.sizeX.value}px`;
		this.renderer.view.style.height = `${model.renderState.sizeY.value}px`;
	}

	public renderView(node: DisplayObject) {
		//@ts-ignore
		this.view.node = node;
		this.renderer.render(node);
	}
}
