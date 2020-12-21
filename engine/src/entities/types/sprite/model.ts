import { EntityRenderModel } from '../../../rendering/model';
import { ReadOnlyDataSource, DataSource, ArrayDataSource } from 'aurumjs';
import { CommonEntity } from '../../../models/entities';
import { ResourceWrapper } from '../../../resources/abstract_resource_manager';

export interface SpriteEntityRenderModel extends EntityRenderModel {
	texture: ReadOnlyDataSource<string | HTMLCanvasElement | HTMLImageElement | ResourceWrapper<HTMLImageElement, string>>;
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

export interface SpriteEntity extends CommonEntity {
	texture?: DataSource<string | HTMLCanvasElement | HTMLImageElement | ResourceWrapper<HTMLImageElement, string>>;
	tint?: DataSource<string>;
	/**
	 * Offset from the texture at which drawing begins
	 */
	drawOffsetX?: DataSource<number>;
	drawOffsetY?: DataSource<number>;
	/**
	 * with and height to draw starting at the source point
	 */
	drawDistanceX?: DataSource<number>;
	drawDistanceY?: DataSource<number>;
	class?: SpriteEntity[] | ArrayDataSource<SpriteEntity>;
}
