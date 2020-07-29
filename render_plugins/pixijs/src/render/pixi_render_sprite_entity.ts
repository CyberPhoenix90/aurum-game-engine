import { Color, SpriteEntityRenderModel, SpriteGraphNode } from 'aurum-game-engine';
import { ReadOnlyDataSource } from 'aurumjs';
import { BaseTexture, Sprite, Texture as PixiTexture } from 'pixi.js';
import { NoRenderEntity } from './pixi_no_render_entity';

export const textureMap: Map<string, BaseTexture> = new Map();
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

	protected createTexture(texture: ReadOnlyDataSource<string>, model: SpriteEntityRenderModel): PixiTexture {
		if (!texture.value) {
			return RenderSpriteEntity.voidTexture;
		}

		if (!textureMap.has(texture.value)) {
			if (pendingTextureMap.has(texture.value)) {
				const img = pendingTextureMap.get(texture.value);
				img.addEventListener('load', () => {
					this.handleTextureReady(texture, img, model);
				});
			} else {
				const img = document.createElement('img');
				pendingTextureMap.set(texture.value, img);
				img.addEventListener('load', () => {
					this.handleTextureReady(texture, img, model);
				});
				img.src = texture.value;
			}
			return RenderSpriteEntity.voidTexture;
		}

		return this.wrapTexture(textureMap.get(texture.value), model);
	}

	private handleTextureReady(texture: ReadOnlyDataSource<string>, img: HTMLImageElement, model: SpriteEntityRenderModel) {
		pendingTextureMap.delete(texture.value);
		const bt = new BaseTexture(img);
		this.displayObject.texture = this.wrapTexture(bt, model);
		textureMap.set(texture.value, bt);
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
		if (model.sizeX.value === undefined && model.scaleX.value !== 1) {
			this.displayObject.width = bt.width * model.scaleX.value;
		}
		if (model.sizeY.value === undefined && model.scaleY.value !== 1) {
			this.displayObject.height = bt.height * model.scaleY.value;
		}
		result.updateUvs();
		return result;
	}

	public bind(model: SpriteGraphNode) {
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
