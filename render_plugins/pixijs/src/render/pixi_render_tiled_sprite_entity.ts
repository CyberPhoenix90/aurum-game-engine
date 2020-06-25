import { SpriteEntityRenderModel } from 'aurum-game-engine';
import { RenderSpriteEntity } from './pixi_render_sprite_entity';

export class RenderTiledSpriteEntity extends RenderSpriteEntity {
	protected createDisplayObject(model: SpriteEntityRenderModel) {
		const texture = this.createTexture(model.texture);
		return new PIXI.TilingSprite(texture);
	}
}
