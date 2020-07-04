import { BlendModes, EntityRenderModel } from 'aurum-game-engine';
import { CancellationToken } from 'aurumjs';
import { Container, filters, BLEND_MODES } from 'pixi.js';

export class NoRenderEntity {
	public token: CancellationToken;
	public readonly id: number;
	public readonly children: NoRenderEntity[];

	public parent: NoRenderEntity;
	public displayObject: Container;

	constructor(model: EntityRenderModel) {
		this.id = model.uid;
		this.token = new CancellationToken();

		model.cancellationToken.chain(this.token);
		this.displayObject = this.createDisplayObject(model);
		//@ts-ignore
		this.displayObject.entity = model;
		//@ts-ignore
		this.displayObject.renderNode = this;
		this.displayObject.name = model.name;
		this.children = [];

		this.bind(model);
	}

	public dispose(): void {
		this.token.cancel();
		this.children.forEach((c) => c.dispose());
		this.displayObject.parent.removeChild(this.displayObject);
	}

	public bind(model: EntityRenderModel): void {
		model.visible.listenAndRepeat((v) => {
			this.displayObject.visible = v;
		}, this.token);

		// if ('fragmentShaders' in style) {
		// 	this.setShaders(style.fragmentShaders);
		// 	if (this.style.blendMode) {
		// 		this.setBlendMode(this.style);
		// 	}
		// }

		model.positionX.listenAndRepeat((v) => {
			if (v !== undefined) {
				this.displayObject.x = v;
			}
		}, this.token);

		model.positionY.listenAndRepeat((v) => {
			if (v !== undefined) {
				this.displayObject.y = v;
			}
		}, this.token);

		model.sizeX.listenAndRepeat((v) => {
			if (v !== undefined) {
				this.displayObject.width = v * model.scaleX.value;
			}
		}, this.token);

		model.sizeY.listenAndRepeat((v) => {
			if (v !== undefined) {
				this.displayObject.height = v * model.scaleY.value;
			}
		}, this.token);

		model.scaleX.listenAndRepeat((v) => {
			if (model.sizeX.value !== undefined) {
				this.displayObject.width = model.sizeX.value * v;
			}
		}, this.token);

		model.scaleY.listenAndRepeat((v) => {
			if (model.sizeY.value !== undefined) {
				this.displayObject.height = model.sizeY.value * v;
			}
		}, this.token);

		model.clip.unique().listenAndRepeat((v) => {
			if (v) {
				const mask = new PIXI.Graphics();
				mask.lineStyle(5, 0xff0000);
				mask.beginFill(0x880000);
				mask.drawRect(0, 0, model.sizeX.value, model.sizeY.value);
				mask.endFill();

				this.displayObject.mask = mask;
				this.displayObject.addChild(mask);
			} else {
				this.displayObject.removeChild(this.displayObject.mask as any);
			}
		}, this.token);

		model.alpha.listenAndRepeat((v) => {
			this.displayObject.alpha = v;
		}, this.token);

		model.blendMode.listenAndRepeat((v) => {
			this.setBlendMode(model, v);
		}, this.token);

		model.zIndex.listenAndRepeat((v) => {
			if (this.parent) {
				this.parent.displayObject.children.sort((a, b) => ((a as any).entity.zIndex.value || 0) - (b as any).entity.zIndex.value || 0);
			}
		}, this.token);
	}

	private setBlendMode(model: EntityRenderModel, blendMode: BlendModes = BlendModes.NORMAL) {
		let blendModeTarget = this.displayObject;
		if (this.displayObject.constructor.name === 'Container' && blendMode !== BlendModes.NORMAL) {
			const alphaFilter = new filters.AlphaFilter();
			this.displayObject.filters = [alphaFilter];
		}
		if (this.displayObject.filters && this.displayObject.filters.length > 0) {
			//@ts-ignore
			blendModeTarget = this.displayObject.filters[this.displayObject.filters.length - 1];
		}
		switch (blendMode) {
			case BlendModes.NORMAL:
				//@ts-ignore
				blendModeTarget.blendMode = BLEND_MODES.NORMAL;
				break;
			case BlendModes.ADD:
				//@ts-ignore
				blendModeTarget.blendMode = BLEND_MODES.ADD;
				break;
			case BlendModes.MULTIPLY:
				//@ts-ignore
				blendModeTarget.blendMode = PIXI.BLEND_MODES.MULTIPLY;
				break;
			case BlendModes.SUB:
				//@ts-ignore
				blendModeTarget.blendMode = PIXI.BLEND_MODES.DARKEN;
				break;
		}
	}

	// protected setShaders(shaders: FragmentShader[]) {
	// 	this.displayObject.filters = shaders.map((s) => this.createShader(s));
	// }

	// protected createShader(shader: FragmentShader): Filter<ShaderUniforms> {
	// 	if (shader instanceof PIXI.Filter) {
	// 		return shader;
	// 	}

	// 	return new Filter('', shader.source, shader.uniforms as any);
	// }

	protected createDisplayObject(model: EntityRenderModel) {
		return new Container();
	}
}
