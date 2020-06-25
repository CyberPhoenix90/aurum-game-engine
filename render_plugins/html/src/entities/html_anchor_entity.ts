import { AbstractEntity, RenderableType, JSONObject, EntityConfiguration } from 'illusion_engine';

export interface HtmlAnchorEntityConfig extends EntityConfiguration {
    domNode: HTMLElement | string;
}

export class HtmlAnchorEntity extends AbstractEntity {
    private config: HtmlAnchorEntityConfig;

    constructor(config: HtmlAnchorEntityConfig) {
        if (typeof config.domNode === 'string') {
            const div = document.createElement('div');
            div.innerHTML = config.domNode;
            config.domNode = div.children[0] as HTMLElement;
        }

        super(config);
        this.config = config;
    }

    protected get renderableType(): RenderableType {
        return ('HTML_ANCHOR' as any) as RenderableType;
    }
    protected get renderPayload(): JSONObject<any> {
        return {
            domNode: this.config.domNode
        };
    }
}
