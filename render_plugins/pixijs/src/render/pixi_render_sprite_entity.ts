import { Color, ResourceWrapper, SpriteGraphNode } from 'aurum-game-engine';
import { BaseTexture, Sprite, Texture as PixiTexture } from 'pixi.js';
import { NoRenderEntity } from './pixi_no_render_entity';

export const textureMap: Map<string | HTMLCanvasElement | HTMLImageElement | ResourceWrapper<HTMLImageElement, string>, BaseTexture> = new Map();
export const pendingTextureMap: Map<string | ResourceWrapper<HTMLImageElement, string>, Promise<HTMLImageElement>> = new Map();
const c = document.createElement('canvas');
c.width = 1;
c.height = 1;
export class RenderSpriteEntity extends NoRenderEntity {
	public displayObject: Sprite;
	public static voidTexture: PixiTexture = new PixiTexture(new BaseTexture(c));

	constructor(config: SpriteGraphNode) {
		super(config);
	}

	protected createDisplayObject(model: SpriteGraphNode) {
		const texture = this.createTexture(model);
		return new Sprite(texture);
	}

	protected createTexture(model: SpriteGraphNode): PixiTexture {
		if (!model.resolvedModel.texture.value) {
			return RenderSpriteEntity.voidTexture;
		}

		const value = model.resolvedModel.texture.value;

		if (typeof value === 'string') {
			if (!textureMap.has(value)) {
				if (pendingTextureMap.has(value)) {
					pendingTextureMap.get(value).then((img) => {
						this.handleTextureReady(value, img, model);
					});
				} else {
					const img = document.createElement('img');
					pendingTextureMap.set(
						value,
						new Promise((resolve, reject) => {
							img.addEventListener('load', () => {
								resolve(img);
								this.handleTextureReady(value, img, model);
							});
							img.addEventListener('error', (e) => {
								reject(e);
							});
						})
					);
					img.src = value;
				}
				return RenderSpriteEntity.voidTexture;
			}
		} else if (value instanceof HTMLCanvasElement || value instanceof HTMLImageElement) {
			if (!textureMap.has(value)) {
				textureMap.set(value, new BaseTexture(value));
			}
		} else {
			if (!textureMap.has(value)) {
				if (pendingTextureMap.has(value)) {
					pendingTextureMap.get(value).then((img) => {
						this.handleTextureReady(value, img, model);
					});
				} else {
					if (value.isLoaded) {
						textureMap.set(value, new BaseTexture(value.resource));
					} else {
						pendingTextureMap.set(
							value,
							value.load().then((img) => {
								this.handleTextureReady(value, img, model);
								return img;
							})
						);
					}
				}
				return RenderSpriteEntity.voidTexture;
			}
		}

		return this.wrapTexture(textureMap.get(model.resolvedModel.texture.value), model);
	}

	private handleTextureReady(texture: string | ResourceWrapper<HTMLImageElement, string>, img: HTMLImageElement, model: SpriteGraphNode) {
		pendingTextureMap.delete(texture);
		const bt = new BaseTexture(img);
		if (!this.token.isCanceled) {
			this.displayObject.texture = this.wrapTexture(bt, model);
		}
		textureMap.set(texture, bt);
	}

	private wrapTexture(bt: BaseTexture, model: SpriteGraphNode): PixiTexture {
		const renderState = model.renderState;
		const result = new PixiTexture(bt);
		if (renderState.drawDistanceX.value !== undefined) {
			result.frame.width = renderState.drawDistanceX.value;
		}
		if (renderState.drawDistanceY.value !== undefined) {
			result.frame.height = renderState.drawDistanceY.value;
		}
		if (renderState.rotation.value) {
			result.rotate = renderState.rotation.value;
		}
		if (renderState.drawOffsetX.value !== undefined) {
			result.frame.x = renderState.drawOffsetX.value;
		}
		if (renderState.drawOffsetY.value !== undefined) {
			result.frame.y = renderState.drawOffsetY.value;
		}
		if (this.displayObject && (renderState.sizeX.value === undefined || model.resolvedModel.width.value === 'auto')) {
			this.displayObject.width = bt.width * renderState.scaleX.value;
		}

		if (this.displayObject && (renderState.sizeY.value === undefined || model.resolvedModel.height.value === 'auto')) {
			this.displayObject.height = bt.height * renderState.scaleY.value;
		}

		result.updateUvs();
		return result;
	}

	public bind(model: SpriteGraphNode) {
		model.resolvedModel.width.listenAndRepeat((v) => {
			if (v === 'auto') {
				this.displayObject.width = this.displayObject.texture.baseTexture.realWidth;
				model.renderState.sizeX.update(this.displayObject.texture.baseTexture.realWidth);
			}
		});

		model.resolvedModel.height.listenAndRepeat((v) => {
			if (v === 'auto') {
				this.displayObject.height = this.displayObject.texture.baseTexture.realHeight;
				model.renderState.sizeY.update(this.displayObject.texture.baseTexture.realHeight);
			}
		});

		if (model.renderState.sizeX.value === undefined) {
			this.displayObject.width = this.displayObject.width * model.renderState.scaleX.value;
		}
		if (model.renderState.sizeY.value === undefined) {
			this.displayObject.height = this.displayObject.height * model.renderState.scaleY.value;
		}

		model.renderState.tint.listenAndRepeat((v) => {
			if (v) {
				this.displayObject.tint = Color.fromString(v).toRGBNumber();
			} else {
				this.displayObject.tint = 0xffffffff;
			}
		}, this.token);

		model.renderState.drawOffsetX.listenAndRepeat((v) => {
			if (v === undefined) {
				this.displayObject.texture.frame.x = 0;
			} else {
				this.displayObject.texture.frame.x = v;
			}
			this.displayObject.texture.updateUvs();
		}, this.token);

		model.renderState.drawOffsetY.listenAndRepeat((v) => {
			if (v === undefined) {
				this.displayObject.texture.frame.y = 0;
			} else {
				this.displayObject.texture.frame.y = v;
			}
			this.displayObject.texture.updateUvs();
		}, this.token);

		model.renderState.drawDistanceX.listenAndRepeat((v) => {
			if (v === undefined) {
				this.displayObject.texture.frame.width = this.displayObject.texture.baseTexture.realWidth;
			} else {
				this.displayObject.texture.frame.width = v;
			}
			this.displayObject.texture.updateUvs();
		}, this.token);

		model.renderState.drawDistanceY.listenAndRepeat((v) => {
			if (v === undefined) {
				this.displayObject.texture.frame.height = this.displayObject.texture.baseTexture.realHeight;
			} else {
				this.displayObject.texture.frame.height = v;
			}
			this.displayObject.texture.updateUvs();
		}, this.token);

		super.bind(model);
	}
}
