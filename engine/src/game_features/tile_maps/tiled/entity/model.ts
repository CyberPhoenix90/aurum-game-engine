import { CommonEntity } from '../../../../models/entities';
import { EntityRenderModel } from '../../../../rendering/model';
import { TiledLayer } from '../tiled_layer';
import { TiledMapModel } from '../tiled_map_format';
import { Tileset } from '../tileset';
import { EntityFactory, MapObject } from './tiled_map_entity';

export interface TiledMapEntity extends CommonEntity {
	resourceRootUrl?: string;
	tilesets?: Tileset[];
	mapObjects?: MapObject[];
	layers?: TiledLayer[];
	mapData?: TiledMapModel;
	entityFactory?: Readonly<EntityFactory>;
}

export interface TiledMapRenderModel extends EntityRenderModel {
	tilesets: Tileset[];
	layers: TiledLayer[];
	mapData: TiledMapModel;
}
