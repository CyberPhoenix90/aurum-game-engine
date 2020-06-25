import { AbstractEntity, CommonStyleModel, LinkingVector2D, Vector2D, CancellationToken } from 'illusion_engine';
import { CommonStyle } from './abstract_render_entity';

export interface NoRenderEntityConfig {
    id: number;
    style: CommonStyle;
    reference: AbstractEntity;
    margin: { left: number; right: number; top: number; bottom: number };
    name?: string;
    position: Vector2D;
    size: Vector2D;
}

export class NoRenderEntity {
    public token: CancellationToken;
    public readonly id: number;
    public readonly name: string;
    public readonly position: Vector2D;
    public readonly children: NoRenderEntity[];
    public readonly size: Vector2D;
    public readonly style: CommonStyleModel;
    public readonly originOffset: LinkingVector2D;

    protected marginOffset: { left: number; right: number; top: number; bottom: number };

    public parent: NoRenderEntity;
    public htmlNode: HTMLElement;

    constructor(config: NoRenderEntityConfig) {
        this.id = config.id;
        this.token = new CancellationToken();
        this.htmlNode = this.createHtmlNode(config);
        this.htmlNode.style.position = 'absolute';
        this.htmlNode.style.padding = 'none';
        this.htmlNode.style.margin = 'none';
        //@ts-ignore
        this.htmlNode.entity = config.reference;
        //@ts-ignore
        this.htmlNode.renderNode = this;

        this.htmlNode.setAttribute('name', config.name);

        this.marginOffset = config.margin;
        this.children = [];
        this.position = config.position;

        this.style = config.style;

        this.style.origin = this.style.origin || { x: 0, y: 0 };
        this.size = config.size;
        this.originOffset = new LinkingVector2D(() => this.size.x * this.style.origin.x, () => this.size.y * this.style.origin.y);
        this.updateStyle(config.style);
        config.reference.onPositionChange.subscribe(() => {
            this.update();
        }, config.reference.cancellationToken);

        this.update();
    }

    public update() {
        this.htmlNode.style.left = `${this.position.x + (this.parent ? this.parent.marginOffset.left : 0) - this.originOffset.x}px`;
        this.htmlNode.style.top = `${this.position.y + (this.parent ? this.parent.marginOffset.top : 0) - this.originOffset.y}px`;
        this.htmlNode.style.width = `${this.size.x}px`;
        this.htmlNode.style.height = `${this.size.y}px`;
    }

    public dispose(): void {
        this.token.cancel();
        this.children.forEach(c => c.dispose());
        this.htmlNode.remove();
    }

    public updateRenderPayload(renderPayload: any) {}
    public renderAction(renderPayload: any) {}

    public updateStyle(style: Partial<CommonStyleModel>): void {
        if ('visible' in style) {
            this.htmlNode.style.display = style.visible ? 'block' : 'none';
        }
        if ('alpha' in style) {
            this.htmlNode.style.opacity = style.alpha.toString();
        }
        if ('margin' in style) {
            for (const c of this.children) {
                c.update();
            }
        }

        for (const key of Object.keys(style)) {
            this.style[key] = style[key];
        }
        this.update();
    }

    protected createHtmlNode(config: NoRenderEntityConfig): HTMLElement {
        return document.createElement('div');
    }
}
