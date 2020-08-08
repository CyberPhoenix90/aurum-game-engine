import { BlendModes, CommonEntity, EntityRenderModel, SceneGraphNode, SceneGraphNodeModel, Shader } from 'aurum-game-engine';
import { CancellationToken, dsUnique } from 'aurumjs';
import { BLEND_MODES, Container, Filter, filters } from 'pixi.js';

export class NoRenderEntity {
	public token: CancellationToken;
	public readonly id: number;
	public readonly children: NoRenderEntity[];

	public parent: NoRenderEntity;
	public displayObject: Container;

	constructor(model: SceneGraphNode<CommonEntity>) {
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

	public bind(model: SceneGraphNode<CommonEntity>): void {
		model.renderState.visible.listenAndRepeat((v) => {
			this.displayObject.visible = v;
		}, this.token);

		model.renderState.shader.listenAndRepeat((change) => {
			this.displayObject.filters = [];
			switch (change.operation) {
				case 'add':
					this.displayObject.filters.push(...change.items.map((s) => this.createShader(s)));
					break;
				case 'remove':
					throw new Error('not implemented');
			}
		});

		model.renderState.positionX.listenAndRepeat((v) => {
			if (v !== undefined) {
				this.displayObject.x = v;
			}
		}, this.token);

		model.renderState.positionY.listenAndRepeat((v) => {
			if (v !== undefined) {
				this.displayObject.y = v;
			}
		}, this.token);

		model.renderState.sizeX.listenAndRepeat((v) => {
			if (v !== undefined) {
				this.displayObject.width = v * model.renderState.scaleX.value;
			}
		}, this.token);

		model.renderState.sizeY.listenAndRepeat((v) => {
			if (v !== undefined) {
				this.displayObject.height = v * model.renderState.scaleY.value;
			}
		}, this.token);

		model.renderState.scaleX.listenAndRepeat((v) => {
			if (model.renderState.sizeX.value !== undefined) {
				this.displayObject.width = model.renderState.sizeX.value * v;
			}
		}, this.token);

		model.renderState.scaleY.listenAndRepeat((v) => {
			if (model.renderState.sizeY.value !== undefined) {
				this.displayObject.height = model.renderState.sizeY.value * v;
			}
		}, this.token);

		model.renderState.clip.transform(dsUnique()).listenAndRepeat((v) => {
			if (v) {
				const mask = new PIXI.Graphics();
				mask.lineStyle(5, 0xff0000);
				mask.beginFill(0x880000);
				mask.drawRect(0, 0, model.renderState.sizeX.value, model.renderState.sizeY.value);
				mask.endFill();

				this.displayObject.mask = mask;
				this.displayObject.addChild(mask);
			} else {
				this.displayObject.removeChild(this.displayObject.mask as any);
			}
		}, this.token);

		model.renderState.alpha.listenAndRepeat((v) => {
			this.displayObject.alpha = v;
		}, this.token);

		model.renderState.blendMode.listenAndRepeat((v) => {
			this.setBlendMode(model.renderState, v);
		}, this.token);

		model.renderState.zIndex.listenAndRepeat((v) => {
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

	protected createShader(shaderSource: Shader): Filter {
		const shader = new Filter(shaderSource.vertex, shaderSource.fragment);
		if (shaderSource.uniforms)
			for (const key in shaderSource.uniforms) {
				shader.uniforms[key] = shaderSource.uniforms[key];
			}

		return shader;
	}

	protected createDisplayObject(model: SceneGraphNodeModel<CommonEntity>): Container {
		return new Container();
	}
}
