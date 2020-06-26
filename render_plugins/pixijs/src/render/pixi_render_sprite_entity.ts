import { SpriteEntityRenderModel, Color } from 'aurum-game-engine';
import { ReadOnlyDataSource } from 'aurumjs';
import { BaseTexture, Sprite, Texture as PixiTexture } from 'pixi.js';
import { NoRenderEntity } from './pixi_no_render_entity';

export const textureMap: Map<string, BaseTexture> = new Map();

export class RenderSpriteEntity extends NoRenderEntity {
	public displayObject: Sprite;
	public static voidTexture: PixiTexture = new PixiTexture(new BaseTexture(document.createElement('canvas')));

	constructor(config: SpriteEntityRenderModel) {
		super(config);
	}

	protected createDisplayObject(model: SpriteEntityRenderModel) {
		const texture = this.createTexture(model.texture, model);
		return new Sprite(texture);
	}

	protected createTexture(texture: ReadOnlyDataSource<string>, model: SpriteEntityRenderModel): PixiTexture {
		if (!texture.value) {
			return RenderSpriteEntity.voidTexture;
		}

		let result: PixiTexture;
		if (!textureMap.has(texture.value)) {
			const img = document.createElement('img');
			const bt = new BaseTexture(img);
			img.addEventListener('load', () => {
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
				this.displayObject.texture.updateUvs();
			});
			img.src = texture.value;
			textureMap.set(texture.value, bt);
		}

		result = new PixiTexture(textureMap.get(texture.value));
		return result;
	}

	public bind(model: SpriteEntityRenderModel) {
		model.tint.listenAndRepeat((v) => {
			if (v) {
				this.displayObject.tint = Color.fromString(v).toRGBNumber();
			} else {
				this.displayObject.tint = 0xffffffff;
			}
		}, this.token);

		model.drawOffsetX.listenAndRepeat((v) => {
			if (v === undefined) {
				this.displayObject.texture.frame.x = 0;
			} else {
				this.displayObject.texture.frame.x = v;
			}
			this.displayObject.texture.updateUvs();
		}, this.token);

		model.drawOffsetY.listenAndRepeat((v) => {
			if (v === undefined) {
				this.displayObject.texture.frame.y = 0;
			} else {
				this.displayObject.texture.frame.y = v;
			}
			this.displayObject.texture.updateUvs();
		}, this.token);

		model.drawDistanceX.listenAndRepeat((v) => {
			if (v === undefined) {
				this.displayObject.texture.frame.width = this.displayObject.texture.baseTexture.realWidth;
			} else {
				this.displayObject.texture.frame.width = v;
			}
			this.displayObject.texture.updateUvs();
		}, this.token);

		model.drawDistanceY.listenAndRepeat((v) => {
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
