import { ReadOnlyDataSource, ArrayDataSource, DataSource } from 'aurumjs';
import { RenderableType, BlendModes, Shader } from '../models/entities';

export interface EntityRenderModel {
	renderableType: RenderableType;
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

export interface TextureEntityRenderModel extends EntityRenderModel {}
export interface NineSliceBoxSpriteEntityRenderModel extends EntityRenderModel {}
