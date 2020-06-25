import { CameraStyleModel } from 'illusion_engine';
import { AbstractRenderEntity, RenderEntityConfig } from './abstract_render_entity';
import { NoRenderEntity, NoRenderEntityConfig } from './no_render_entity';

export interface RenderCameraConfig extends RenderEntityConfig {
    view: HTMLCanvasElement;
    style: CameraStyle;
}

export interface CameraStyle extends CameraStyleModel {}

export class RenderCameraEntity extends AbstractRenderEntity {
    public style: CameraStyle;
    private rootNode: HTMLElement;
    private added: boolean = false;

    constructor(config: RenderCameraConfig) {
        super(config);
        const div = document.createElement('div');
        config.view.appendChild(div);
        this.rootNode = div;
        this.rootNode.style.transformOrigin = '0 0';
        this.rootNode.style.background = config.style.backgroundColor || '#000000';
    }

    protected createHtmlNode(config: NoRenderEntityConfig): HTMLElement {
        const div = document.createElement('div');
        div.style.pointerEvents = 'none';
        return div;
    }

    public updateStyle(style: Partial<CameraStyleModel>): void {
        super.updateStyle(style);
        this.setSize();
    }
    private setSize() {
        if (this.rootNode) {
            this.rootNode.style.width = `${this.size.x}px`;
            this.rootNode.style.height = `${this.size.y}px`;
            this.rootNode.style.transform = `scaleX(${this.style.cameraSize.x / this.rootNode.clientWidth}) scaleY(${this.style.cameraSize.y /
                this.rootNode.clientHeight})`;
        }
    }

    public renderView(node: NoRenderEntity) {
        if (!this.added) {
            this.rootNode.appendChild(node.htmlNode);
            this.added = true;
            this.setSize();
        }
    }

    protected mergeStyle(style: Partial<CameraStyle> = {}) {
        for (const key of Object.keys(style)) {
            this.style[key] = style[key];
        }
    }
}
