import { CancellationToken, ReadOnlyDataSource, ArrayDataSource, DataSource } from 'aurumjs';
import { RenderableType, BlendModes, Shader } from '../models/entities';
import { PaintOperation } from '../entities/canvas_entity';

export interface EntityRenderModel {
	uid: number;
	parent: EntityRenderModel;
	renderableType: RenderableType;
	parentUid: number;
	cancellationToken: CancellationToken;
	name: string;
	getAbsolutePositionX(): number;
	getAbsolutePositionY(): number;
	positionX: ReadOnlyDataSource<number>;
	positionY: ReadOnlyDataSource<number>;
	sizeX: DataSource<number>;
	sizeY: DataSource<number>;
	scaleX: DataSource<number>;
	scaleY: DataSource<number>;
	zIndex: ReadOnlyDataSource<number>;
	clip: ReadOnlyDataSource<boolean>;
	visible: ReadOnlyDataSource<boolean>;
	alpha: ReadOnlyDataSource<number>;
	blendMode?: ReadOnlyDataSource<BlendModes>;
	shader: ArrayDataSource<Shader>;
}

export interface SpriteEntityRenderModel extends EntityRenderModel {
	texture: ReadOnlyDataSource<string>;
	tint: ReadOnlyDataSource<string>;
	/**
	 * Offset from the texture at which drawing begins
	 */
	drawOffsetX: ReadOnlyDataSource<number>;
	drawOffsetY: ReadOnlyDataSource<number>;
	/**
	 * with and height to draw starting at the source point
	 */
	drawDistanceX: ReadOnlyDataSource<number>;
	drawDistanceY: ReadOnlyDataSource<number>;
}

export interface CanvasEntityRenderModel extends EntityRenderModel {
	painerOperations: ArrayDataSource<PaintOperation>;
}

export interface CameraEntityRenderModel extends EntityRenderModel {
	view: HTMLElement;
	backgroundColor: ReadOnlyDataSource<string>;
}

export interface TextureEntityRenderModel extends EntityRenderModel {}
export interface LabelEntityRenderModel extends EntityRenderModel {
	text: ReadOnlyDataSource<string>;
	renderCharCount: ReadOnlyDataSource<number>;
	color: ReadOnlyDataSource<string>;
	stroke: ReadOnlyDataSource<string>;
	strokeThickness: ReadOnlyDataSource<number>;
	fontSize: ReadOnlyDataSource<number>;
	fontStyle: ReadOnlyDataSource<string>;
	fontWeight: ReadOnlyDataSource<string>;
	fontFamily: ReadOnlyDataSource<string>;
	dropShadowDistance: ReadOnlyDataSource<number>;
	dropShadow: ReadOnlyDataSource<boolean>;
	dropShadowAngle: ReadOnlyDataSource<number>;
	dropShadowColor: ReadOnlyDataSource<string>;
	dropShadowFuzziness: ReadOnlyDataSource<number>;
	textBaseline: ReadOnlyDataSource<'top' | 'bottom' | 'hanging' | 'alphabetic' | 'middle'>;
}
export interface ContainerEntityRenderModel extends EntityRenderModel {}
export interface NineSliceBoxSpriteEntityRenderModel extends EntityRenderModel {}
