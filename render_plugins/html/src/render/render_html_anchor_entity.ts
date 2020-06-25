import { AbstractRenderEntity, RenderEntityConfig } from './abstract_render_entity';

export interface RenderHtmlAnchorEntityConfig extends RenderEntityConfig {
    domNode: HTMLElement;
}

export class RenderHtmlAnchorEntity extends AbstractRenderEntity {
    public htmlNode: HTMLElement;

    constructor(config: RenderHtmlAnchorEntityConfig) {
        super(config);
        config.domNode.style.pointerEvents = 'all';
    }

    protected createHtmlNode(config: RenderHtmlAnchorEntityConfig): HTMLElement {
        config.domNode.style.pointerEvents = 'all';
        return config.domNode;
    }

    public updateRenderPayload(renderPayload: any) {
        this.htmlNode.remove();
        renderPayload.domNode.style.pointerEvents = 'all';
        this.htmlNode.appendChild(renderPayload.domNode);
    }
}
