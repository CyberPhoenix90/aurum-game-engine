import { Renderable, AurumComponentAPI, ArrayDataSource } from 'aurumjs';
import { PointLike } from '../../../models/point';
import {
	TiledMapCustomProperties,
	TiledMapModel,
	TiledMapTileModel,
	TiledMapTilesetModel,
	TiledMapLayerModel,
	TiledMapObjectModel,
	TiledObjectShapeData
} from './tiled_map_format';
import { CommonEntityProps, CommonEntity, RenderableType } from '../../../models/entities';
import { Tileset } from './tileset';
import { TiledLayer } from './tiled_layer';
import { EntityRenderModel } from '../../../rendering/model';
import { SceneGraphNode } from '../../../models/scene_graph';
import { AbstractShape } from '../../../math/shapes/abstract_shape';
import { toSource } from '../../../utilities/data/to_source';
import { _ } from '../../../utilities/other/streamline';
import { Polygon } from '../../../math/shapes/polygon';
import { Circle } from '../../../math/shapes/circle';
import { Rectangle } from '../../../math/shapes/rectangle';
import { Vector2D } from '../../../math/vectors/vector2d';

export interface EntityFactory {
	[type: string]: (position: PointLike, props: TiledMapCustomProperties[], shape: AbstractShape) => Renderable;
}

export interface MapObject {
	layer: number;
	object: Renderable;
}

export interface TiledMapProps extends CommonEntityProps {
	resourceRootUrl: string;
	model: TiledMapModel;
	tilesets?: Tileset[];
	onAttach?(node: SceneGraphNode<TiledMapEntity>, renderModel: TiledMapRenderModel): void;
	onDetach?(node: SceneGraphNode<TiledMapEntity>, renderModel: TiledMapRenderModel): void;
	entityFactory?: Readonly<EntityFactory>;
}

export interface TiledMapEntity extends CommonEntity {
	getTileMetaDataByGid(tileGid: number): TiledMapTileModel;
	getTileMetadata(layer: number, tileX: number, tileY: number): TiledMapTileModel;
	hasTile(layer: number, x: number, y: number): boolean;
	resourceRootUrl: string;
	tilesets: Tileset[];
	mapObjects: MapObject[];
	layers: TiledLayer[];
	mapData: TiledMapModel;
	entityFactory?: Readonly<EntityFactory>;
}

export interface TiledMapRenderModel extends EntityRenderModel {
	tilesets: Tileset[];
	layers: TiledLayer[];
	mapData: TiledMapModel;
}

export function TiledMap(props: TiledMapProps, children: Renderable[], api: AurumComponentAPI): SceneGraphNode<TiledMapEntity> {
	const mapObjects: MapObject[] = [];
	const layers: TiledLayer[] = [];

	props.tilesets = props.tilesets ?? [];
	props.model.tilesets.forEach((t: TiledMapTilesetModel) => {
		props.tilesets.push(new Tileset(t, props.resourceRootUrl));
	});

	props.model.layers.forEach((t: TiledMapLayerModel, index: number) => {
		const layer = new TiledLayer(t, props.model.width, props.model.height);
		processLayer(layer, props, mapObjects, index);
		layers.push(layer);
	});

	const result: SceneGraphNode<TiledMapEntity> = {
		cancellationToken: api.cancellationToken,
		onAttach: props.onAttach,
		onDetach: props.onDetach,
		model: {
			getTileMetaDataByGid(tileGid: number): TiledMapTileModel {
				if (tileGid === 0) {
					return undefined;
				}

				let tileset: Tileset | undefined = props.tilesets.find((t) => t.hasGid(tileGid));
				if (tileset === undefined) {
					throw new Error('something went wrong, hasGid = false for every tileset');
				}
				return tileset.getTileMetadata(tileGid);
			},
			hasTile(layer: number, x: number, y: number): boolean {
				const selectedLayer: TiledLayer | undefined = layers[layer];
				if (selectedLayer === undefined || !selectedLayer.hasData()) {
					return false;
				} else {
					return selectedLayer.hasTile(x, y);
				}
			},
			getTileMetadata(layer: number, tileX: number, tileY: number): TiledMapTileModel {
				if (result.model.hasTile(layer, tileX, tileY)) {
					const selectedLayer: TiledLayer | undefined = layers[layer];

					return result.model.getTileMetaDataByGid(selectedLayer.getTileData(tileX, tileY));
				} else {
					return undefined;
				}
			},
			layers,
			mapObjects,
			mapData: props.model,
			tilesets: props.tilesets,
			x: toSource(props.x, 0),
			y: toSource(props.y, 0),
			originX: toSource(props.originX, 0),
			originY: toSource(props.originY, 0),
			minHeight: toSource(props.minHeight, undefined),
			height: toSource(props.height, 0),
			maxHeight: toSource(props.maxHeight, undefined),
			minWidth: toSource(props.minWidth, undefined),
			width: toSource(props.width, undefined),
			maxWidth: toSource(props.maxWidth, undefined),
			scaleX: toSource(props.scaleX, 1),
			scaleY: toSource(props.scaleY, 1),
			alpha: toSource(props.alpha, 1),
			clip: toSource(props.clip, false),
			marginTop: toSource(props.marginTop, 0),
			marginRight: toSource(props.marginRight, 0),
			marginBottom: toSource(props.marginBottom, 0),
			marginLeft: toSource(props.marginLeft, 0),
			components: props.components
				? props.components instanceof ArrayDataSource
					? props.components
					: new ArrayDataSource(props.components)
				: new ArrayDataSource([]),
			shaders: props.shaders ? (props.shaders instanceof ArrayDataSource ? props.shaders : new ArrayDataSource(props.shaders)) : new ArrayDataSource([]),
			ignoreLayout: toSource(props.ignoreLayout, false),
			spreadLayout: toSource(props.spreadLayout, false),
			name: props.name,
			visible: toSource(props.visible, true),
			zIndex: toSource(props.zIndex, undefined),
			blendMode: toSource(props.blendMode, undefined),
			resourceRootUrl: props.resourceRootUrl
		},
		uid: _.getUId(),
		nodeType: RenderableType.TILE_MAP
	};

	return result;
}

function processLayer(layer: TiledLayer, props: TiledMapProps, mapObjects: MapObject[], index: number): void {
	if (layer.objects && props.entityFactory !== undefined) {
		layer.objects.forEach((o: TiledMapObjectModel) => {
			if (props.entityFactory[o.type] === undefined) {
				console.warn('No entity factory for entity of type' + o.type + ' defined');
			} else {
				const entity: Renderable = props.entityFactory[o.type](
					o,
					o.properties,
					shapeFactory(
						{ x: o.x, y: o.y },
						{
							ellipse: o.ellipse,
							polyline: o.polyline,
							width: o.width,
							height: o.height,
							rotation: o.rotation
						}
					)
				);

				if (entity !== undefined) {
					mapObjects.push({
						layer: index,
						object: entity
					});
				}
			}
		});
	}
}

function shapeFactory(position: PointLike, shapeData: TiledObjectShapeData): AbstractShape {
	if (shapeData.polyline) {
		return new Polygon(
			position,
			shapeData.polyline.map((p) => Vector2D.fromPointLike(p))
		);
	} else if (shapeData.ellipse) {
		return new Circle(Vector2D.fromPointLike({ x: position.x + shapeData.width / 2, y: position.y + shapeData.width / 2 }), shapeData.width / 2);
	} else {
		return new Rectangle(position, new Vector2D(shapeData.width, shapeData.height));
	}
}

// export class _TiledMap extends ContainerEntity {

// 	public hasTileByRectangle(layer: number, rectangle: Rectangle): boolean {
// 		const selectedLayer: TiledLayer | undefined = this.layerModel[layer];
// 		if (selectedLayer === undefined || !selectedLayer.hasData()) {
// 			return false;
// 		} else {
// 			return selectedLayer.hasTileByRectangle(rectangle);
// 		}
// 	}

// 	/**
// 	 * Iterates the whole layer calling the query function for every single tile, if the query returns true, the iteration is aborted
// 	 */
// 	public queryAllTilesInLayer(layerIndex: number, query: (tile: ITiledMapTile, x: number, y: number) => boolean | void): void {
// 		const selectedLayer: TiledLayer | undefined = this.layerModel[layerIndex];
// 		if (selectedLayer) {
// 			for (let x: number = 0; x < selectedLayer.width; x++) {
// 				for (let y: number = 0; y < selectedLayer.height; y++) {
// 					const tileData = this.getTileMetaDataByGid(selectedLayer.getTileData(x, y));
// 					if (tileData) {
// 						if (query(tileData, x, y)) {
// 							return;
// 						}
// 					}
// 				}
// 			}
// 		} else {
// 			throw new Error(`No layer for index ${layerIndex}`);
// 		}
// 	}

// 	public projectRectangleToMapCoordinates(rectangle: Rectangle): Rectangle {
// 		rectangle.x /= this.tileWidth;
// 		rectangle.y /= this.tileHeight;
// 		rectangle.width /= this.tileWidth;
// 		rectangle.height /= this.tileHeight;

// 		let minX, maxX, minY, maxY;

// 		minX = Math.round(rectangle.x);
// 		minY = Math.round(rectangle.y);
// 		maxX = Math.round(rectangle.x + rectangle.width);
// 		maxY = Math.round(rectangle.y + rectangle.height);

// 		return new Rectangle(new Vector2D(minX, minY), new Vector2D(1 + maxX - minX, 1 + maxY - minY));
// 	}

// 	public projectPointToMapCoordinates(point: Vector2D): Vector2D {
// 		return point
// 			.clone()
// 			.componentWiseDivision(new Vector2D(this.tileWidth, this.tileHeight))
// 			.round();
// 	}

// 	public projectMapCoordinatesToRegularCoordinates(point: Vector2D): Vector2D {
// 		return point.clone().componentWiseMultiplication(new Vector2D(this.tileWidth, this.tileHeight));
// 	}

// 	public snapRectangleToTiles(rectangle: Rectangle): Rectangle {
// 		rectangle.x = rectangle.x - (rectangle.x % this.tileWidth);
// 		rectangle.y = rectangle.y - (rectangle.y % this.tileHeight);

// 		rectangle.width = rectangle.width + ((this.tileWidth - (rectangle.width % this.tileWidth)) % this.tileWidth);
// 		rectangle.height = rectangle.height + ((this.tileHeight - (rectangle.height % this.tileHeight)) % this.tileHeight);

// 		return rectangle;
// 	}

// 	public snapPointToTiles(point: Vector2D): Vector2D {
// 		point.x = point.x - (point.x % this.tileWidth);
// 		point.y = point.y - (point.y % this.tileHeight);

// 		return point;
// 	}

// 	public getTileByPosition(point: Vector2D, layer: number): ITiledMapTile {
// 		const p = this.projectPointToMapCoordinates(point);
// 		return this.getTileMetadata(layer, p.x, p.y);
// 	}

// 	public findLayerByName(layerName: string): AbstractEntity | undefined {
// 		return this.children.find((c) => c.name === layerName);
// 	}

// 	public findLayerIndexByName(layerName: string): number {
// 		return this.children.findIndex((c) => c.name === layerName);
// 	}
// }
