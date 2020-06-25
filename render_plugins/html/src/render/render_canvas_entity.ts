import { CanvasEntityAction, CanvasEntityActionType, CanvasEntityState, Color, CommonStyleModel, BlendModes } from 'illusion_engine';
import { AbstractRenderEntity, RenderEntityConfig } from './abstract_render_entity';

export interface RenderCanvasConfig extends RenderEntityConfig {
    state: CanvasEntityState;
}

export class RenderCanvasEntity extends AbstractRenderEntity {
    public htmlNode: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    public state: CanvasEntityState;

    constructor(config: RenderCanvasConfig) {
        super(config);
        this.state = config.state;
        this.context = this.htmlNode.getContext('2d');
        setTimeout(() => {
            this.drawAll();
        });
    }

    protected createHtmlNode() {
        return document.createElement('canvas');
    }

    public update() {
        super.update();
        let dirty = false;
        if (this.htmlNode.width !== this.size.x) {
            this.htmlNode.width = this.size.x;
        }
        if (this.htmlNode.height !== this.size.y) {
            this.htmlNode.height = this.size.y;
        }
        if (dirty) {
            this.drawAll();
        }
    }

    public renderAction(renderPayload) {
        this.drawAction(renderPayload.action);
    }

    public updateRenderPayload(renderPayload: any) {
        this.state = renderPayload.state;
        this.context.canvas.width = this.context.canvas.clientWidth;
        this.context.canvas.height = this.context.canvas.clientHeight;
        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, this.htmlNode.width, this.htmlNode.height);
        this.drawAll();
    }

    private drawAll() {
        for (const action of this.state.actions) {
            this.drawAction(action);
        }
    }

    private drawAction(action: CanvasEntityAction) {
        switch (action.type) {
            case CanvasEntityActionType.BEGIN_FILL:
                this.context.save();
                this.context.fillStyle = Color.fromRGBAHex(action.beginFill.color).toRGBA();
                this.context.globalAlpha = action.beginFill.alpha;
                break;
            case CanvasEntityActionType.END_FILL:
                this.context.restore();
                break;
            case CanvasEntityActionType.FILL_CIRCLE:
                this.context.beginPath();
                this.context.arc(action.fillCircle.point.x, action.fillCircle.point.y, action.fillCircle.radius, 0, Math.PI * 2);
                this.context.fill();
                break;
            case CanvasEntityActionType.FILL_RECT:
                this.context.fillRect(action.fillRect.point.x, action.fillRect.point.y, action.fillRect.size.x, action.fillRect.size.y);
                break;
            case CanvasEntityActionType.FILL_ROUNDED_RECT:
                this.context.fillRect(
                    action.fillRoundedRect.point.x,
                    action.fillRoundedRect.point.y,
                    action.fillRoundedRect.size.x,
                    action.fillRoundedRect.size.y
                    // action.fillRoundedRect.radius
                );
                break;
            case CanvasEntityActionType.MOVE_TO:
                this.context.moveTo(action.moveTo.point.x, action.moveTo.point.y);
                break;
            case CanvasEntityActionType.LINE_TO:
                this.context.lineTo(action.lineTo.point.x, action.lineTo.point.y);
                break;
            case CanvasEntityActionType.LINE_STYLE:
                this.context.lineWidth = action.lineStyle.lineWidth;
                this.context.strokeStyle = Color.fromRGBAHex(action.lineStyle.color).toRGBA();
                break;
        }
    }
}
