import { Color, SpriteEntityRenderModel, SpriteGraphNode } from 'aurum-game-engine';
import { ReadOnlyDataSource } from 'aurumjs';
import { BaseTexture, Sprite, Texture as PixiTexture } from 'pixi.js';
import { NoRenderEntity } from './pixi_no_render_entity';

export const textureMap: Map<string | HTMLCanvasElement, BaseTexture> = new Map();
export const pendingTextureMap: Map<string, HTMLImageElement> = new Map();

export class RenderSpriteEntity extends NoRenderEntity {
	public displayObject: Sprite;
	public static voidTexture: PixiTexture = new PixiTexture(new BaseTexture(document.createElement('canvas')));

	constructor(config: SpriteGraphNode) {
		super(config);
	}

	protected createDisplayObject(model: SpriteGraphNode) {
		const texture = this.createTexture(model.renderState.texture, model.renderState);
		return new Sprite(texture);
	}

	protected createTexture(texture: ReadOnlyDataSource<string | HTMLCanvasElement>, model: SpriteEntityRenderModel): PixiTexture {
		if (!texture.value) {
			return RenderSpriteEntity.voidTexture;
		}

		const value = texture.value;

		if (typeof value === 'string') {
			if (!textureMap.has(value)) {
				if (pendingTextureMap.has(value)) {
					const img = pendingTextureMap.get(value);
					img.addEventListener('load', () => {
						this.handleTextureReady(value, img, model);
					});
				} else {
					const img = document.createElement('img');
					pendingTextureMap.set(value, img);
					img.addEventListener('load', () => {
						this.handleTextureReady(value, img, model);
					});
					img.src = value;
				}
				return RenderSpriteEntity.voidTexture;
			}
		} else {
			if (!textureMap.has(value)) {
				textureMap.set(value, new BaseTexture(value));
			}
		}

		return this.wrapTexture(textureMap.get(texture.value), model);
	}

	private handleTextureReady(texture: string, img: HTMLImageElement, model: SpriteEntityRenderModel) {
		pendingTextureMap.delete(texture);
		const bt = new BaseTexture(img);
		if (!this.token.isCanceled) {
			this.displayObject.texture = this.wrapTexture(bt, model);
		}
		textureMap.set(texture, bt);
	}

	private wrapTexture(bt: BaseTexture, model: SpriteEntityRenderModel): PixiTexture {
		const result = new PixiTexture(bt);
		if (model.drawDistanceX.value !== undefined) {
			result.frame.width = model.drawDistanceX.value;
		}
		if (model.drawDistanceY.value !== undefined) {
			result.frame.height = model.drawDistanceY.value;
		}
		if (model.drawOffsetX.value !== undefined) {
			result.frame.x = model.drawOffsetX.value;
		}
		if (model.drawOffsetY.value !== undefined) {
			result.frame.y = model.drawOffsetY.value;
		}
		if (this.displayObject && model.sizeX.value === undefined) {
			this.displayObject.width = bt.width * model.scaleX.value;
		}
		if (this.displayObject && model.sizeY.value === undefined) {
			this.displayObject.height = bt.height * model.scaleY.value;
		}
		result.updateUvs();
		return result;
	}

	public bind(model: SpriteGraphNode) {
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
