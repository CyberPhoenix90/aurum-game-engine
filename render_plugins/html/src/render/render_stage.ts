import { entityDatabase, RenderableType, RenderNode } from 'illusion_engine';
import { NoRenderEntity } from './no_render_entity';
import { RenderCameraEntity } from './render_camera';
import { RenderCanvasEntity } from './render_canvas_entity';
import { RenderLabelEntity } from './render_label_entity';
import { RenderSpriteEntity } from './render_sprite_entity';
import { RenderHtmlAnchorEntity } from './render_html_anchor_entity';

export class RenderStage {
    public readonly id: number;
    public readonly canvas: HTMLCanvasElement;

    private rootNode: NoRenderEntity;

    constructor(id: number) {
        this.id = id;
    }

    public addNode(payload: RenderNode): void {
        const node = this.createRenderNode(payload);
        entityDatabase.registerEntity(node);
        node.token.addCancelable(() => entityDatabase.deregisterEntity(node));

        if (payload.parentId !== undefined) {
            const parent: NoRenderEntity = entityDatabase.getEntityById(payload.parentId) as NoRenderEntity;
            parent.htmlNode.insertBefore(node.htmlNode, parent.htmlNode.children[payload.index]);
            parent.children.splice(payload.index, 0, node);
            node.parent = parent;
        } else {
            this.rootNode = node;
        }
    }

    public removeNode(id: number) {
        const node = entityDatabase.getEntityById(id) as NoRenderEntity;
        node.parent.children.splice(node.parent.children.findIndex(c => c.id === id), 1)[0].dispose();
    }

    private createRenderNode(payload: RenderNode) {
        switch (payload.renderableType) {
            case RenderableType.NO_RENDER:
                return new NoRenderEntity({
                    id: payload.id,
                    reference: payload.node,
                    name: payload.name,
                    margin: payload.margin,
                    style: payload.style,
                    position: payload.position,
                    size: payload.size
                });
            case ('HTML_ANCHOR' as any) as RenderableType:
                return new RenderHtmlAnchorEntity({
                    id: payload.id,
                    reference: payload.node,
                    domNode: payload.renderPayload.domNode,
                    name: payload.name,
                    margin: payload.margin,
                    style: payload.style,
                    position: payload.position,
                    size: payload.size
                });
            case RenderableType.LABEL:
                return new RenderLabelEntity({
                    id: payload.id,
                    reference: payload.node,
                    name: payload.name,
                    margin: payload.margin,
                    position: payload.position,
                    size: payload.size,
                    style: payload.style,
                    text: payload.renderPayload.text
                });
            case RenderableType.SPRITE:
                return new RenderSpriteEntity({
                    id: payload.id,
                    reference: payload.node,
                    name: payload.name,
                    margin: payload.margin,
                    position: payload.position,
                    size: payload.size,
                    style: payload.style,
                    texture: payload.renderPayload.texture
                });
            case RenderableType.BOX_SPRITE:
                return new RenderSpriteEntity({
                    id: payload.id,
                    reference: payload.node,
                    name: payload.name,
                    margin: payload.margin,
                    position: payload.position,
                    size: payload.size,
                    style: payload.style,
                    texture: payload.renderPayload.texture
                });
            case RenderableType.CANVAS:
                return new RenderCanvasEntity({
                    id: payload.id,
                    reference: payload.node,
                    name: payload.name,
                    margin: payload.margin,
                    position: payload.position,
                    size: payload.size,
                    style: payload.style,
                    state: payload.renderPayload.state
                });
            case RenderableType.CAMERA:
                return new RenderCameraEntity({
                    id: payload.id,
                    reference: payload.node,
                    margin: payload.margin,
                    name: payload.name,
                    view: payload.renderPayload.view,
                    position: payload.position,
                    size: payload.size,
                    style: payload.style
                });
            case RenderableType.TILE_MAP:
                throw new Error('HTML Renderer does not support tilemaps');
        }
    }

    public render(cameraId: number): void {
        const camera: RenderCameraEntity = entityDatabase.getEntityById(cameraId) as RenderCameraEntity;
        camera.position.floor();
        if (this.rootNode) {
            this.rootNode.position.sub(camera.position);
            this.rootNode.update();
            camera.renderView(this.rootNode);
            this.rootNode.position.add(camera.position);
        }
    }
}
