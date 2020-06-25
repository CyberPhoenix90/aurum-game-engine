import { LabelStyleModel, Vector2D } from 'illusion_engine';
import { AbstractRenderEntity, CommonStyle, RenderEntityConfig } from './abstract_render_entity';

export interface RenderLabelConfig extends RenderEntityConfig {
    text: string;
}

export interface LabelStyle extends CommonStyle {
    color: string;
    fontSize: number;
    fontFamily: string;
}

export class RenderLabelEntity extends AbstractRenderEntity {
    public htmlNode: HTMLParagraphElement;
    private renderCharCount: number;
    private text: string;

    constructor(config: RenderLabelConfig) {
        super(config);
    }

    protected createHtmlNode(config: RenderLabelConfig) {
        this.text = config.text;
        const node = document.createElement('div');
        node.style.whiteSpace = 'nowrap';
        node.style.userSelect = 'none';
        node.innerText = config.text.substring(0, this.renderCharCount || config.text.length);
        return node;
    }

    public updateStyle(style: Partial<LabelStyleModel> = {}) {
        if ('color' in style) {
            this.htmlNode.style.color = style.color;
        }

        if ('renderCharCount' in style) {
            this.renderCharCount = style.renderCharCount;
            this.htmlNode.innerText = this.text.substring(0, this.renderCharCount);
        }

        let recomputeShadow = false;
        for (const key of Object.keys(style)) {
            switch (key as keyof LabelStyleModel) {
                case 'color':
                case 'renderCharCount':
                    break;
                case 'fontSize':
                    this.htmlNode.style.fontSize = style[key] + 'px';
                    break;
                case 'dropShadow':
                case 'dropShadowAngle':
                case 'dropShadowColor':
                case 'dropShadowDistance':
                case 'dropShadowFuzziness':
                    recomputeShadow = true;
                    break;
                default:
                    this.htmlNode.style[key] = style[key];
            }
        }
        super.updateStyle(style);
        if (recomputeShadow) {
            if (style.dropShadow) {
                const distance = Vector2D.fromPolarCoordinates(style.dropShadowDistance || 1, style.dropShadowAngle || Math.PI / 4);
                this.htmlNode.style.textShadow = `${distance.x}px ${distance.y}px ${style.dropShadowFuzziness || 0}px ${style.dropShadowColor || 'black'}`;
            } else {
                this.htmlNode.style.textShadow = '';
            }
        }
    }

    public updateRenderPayload(renderPayload: any) {
        this.text = renderPayload.text;
        this.htmlNode.innerText = this.text.substring(0, this.renderCharCount || this.text.length);
    }
}
