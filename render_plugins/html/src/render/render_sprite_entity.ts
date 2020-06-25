import { Color, Image, SpriteStyleModel, Texture, PointLike, safely } from 'illusion_engine';
import { AbstractRenderEntity, CommonStyle, RenderEntityConfig } from './abstract_render_entity';

export interface RenderSpriteConfig extends RenderEntityConfig {
    texture: Texture;
}

export interface SpriteStyle extends CommonStyle {
    /**
     * Offset from the texture at which drawing begins
     */
    drawOffset?: PointLike;
    /**
     * with and height to draw starting at the source point
     */
    drawDistance?: PointLike;
}

export class RenderSpriteEntity extends AbstractRenderEntity {
    public htmlNode: HTMLCanvasElement;
    private spriteStyle: SpriteStyle;
    private texture: Texture;
    private context: CanvasRenderingContext2D;

    constructor(config: RenderSpriteConfig) {
        super(config);
        this.draw();
    }

    protected createHtmlNode(config: RenderSpriteConfig): HTMLCanvasElement {
        this.texture = config.texture;
        return document.createElement('canvas');
    }

    private draw(): void {
        if (!this.texture) {
            return;
        }

        if (!this.context) {
            this.context = this.htmlNode.getContext('2d');
        }
        if (this.spriteStyle && (this.spriteStyle.drawOffset || this.spriteStyle.drawDistance)) {
            this.context.drawImage(
                this.texture.image.source,
                safely(this.spriteStyle.drawOffset.x) || 0,
                safely(this.spriteStyle.drawOffset.y) || 0,
                safely(this.spriteStyle.drawDistance.x) || this.texture.image.width - safely(this.spriteStyle.drawOffset.x) || 0,
                safely(this.spriteStyle.drawDistance.y) || this.texture.image.height - safely(this.spriteStyle.drawOffset.y) || 0,
                0,
                0,
                this.htmlNode.width,
                this.htmlNode.height
            );
        } else {
            this.context.drawImage(this.texture.image.source, 0, 0, this.htmlNode.width, this.htmlNode.height);
        }
    }

    public updateStyle(style: SpriteStyleModel = {}) {
        if (!this.spriteStyle) {
            this.spriteStyle = {};
        }
        if ('drawOffset' in style || 'drawDistance' in style) {
            this.spriteStyle = style;
            this.draw();
        }

        super.updateStyle(style);
    }

    public updateRenderPayload(renderPayload: any) {
        this.texture = renderPayload.texture;
        this.draw();
    }
}
