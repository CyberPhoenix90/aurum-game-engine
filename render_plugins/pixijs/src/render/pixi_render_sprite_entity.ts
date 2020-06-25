import { SpriteEntityRenderModel, Color } from 'aurum-game-engine';
import { ReadOnlyDataSource } from 'aurumjs';
import { BaseTexture, Sprite, Texture as PixiTexture } from 'pixi.js';
import { NoRenderEntity } from './pixi_no_render_entity';

export const textureMap: Map<string, PixiTexture> = new Map();

export class RenderSpriteEntity extends NoRenderEntity {
	public displayObject: Sprite;
	public static voidTexture: PixiTexture = new PixiTexture(new BaseTexture(document.createElement('canvas')));

	constructor(config: SpriteEntityRenderModel) {
		super(config);
	}

	protected createDisplayObject(model: SpriteEntityRenderModel) {
		const texture = this.createTexture(model.texture);
		return new Sprite(texture);
	}

	protected createTexture(texture: ReadOnlyDataSource<string>): PixiTexture {
		if (!texture.value) {
			return RenderSpriteEntity.voidTexture;
		}

		if (!textureMap.has(texture.value)) {
			textureMap.set(texture.value, new PixiTexture(new BaseTexture(texture.value)));
		}

		return textureMap.get(texture.value);
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
