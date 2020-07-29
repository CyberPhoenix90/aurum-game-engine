import { SceneGraphNode, SceneGraphNodeModel } from '../../../../models/scene_graph';
import { TiledMapEntity, TiledMapRenderModel } from './model';
import { layoutAlgorithm } from '../../../../core/layout_engine';
import { RenderableType } from '../../../../models/entities';
import { TiledMapTileModel } from '../tiled_map_format';
import { TiledLayer } from '../tiled_layer';
import { Tileset } from '../tileset';

export class TiledMapGraphNode extends SceneGraphNode<TiledMapEntity> {
	public readonly renderState: TiledMapRenderModel;

	constructor(config: SceneGraphNodeModel<TiledMapEntity>) {
		super(config);
	}

	protected createResolvedModel(): TiledMapEntity {
		const base = this.createBaseResolvedModel();
		return base;
	}

	protected createRenderModel(): TiledMapRenderModel {
		const { x, y, sizeX, sizeY } = layoutAlgorithm(this);
		return {
			alpha: this.resolvedModel.alpha,
			clip: this.resolvedModel.clip,
			renderableType: RenderableType.TILE_MAP,
			positionX: x,
			positionY: y,
			sizeX: sizeX,
			sizeY: sizeY,
			scaleX: this.resolvedModel.scaleX,
			scaleY: this.resolvedModel.scaleY,
			visible: this.resolvedModel.visible,
			zIndex: this.resolvedModel.zIndex,
			blendMode: this.resolvedModel.blendMode,
			shader: this.resolvedModel.shaders,
			layers: this.resolvedModel.layers,
			mapData: this.resolvedModel.mapData,
			tilesets: this.resolvedModel.tilesets
		};
	}

	getTileMetaDataByGid(tileGid: number): TiledMapTileModel {
		if (tileGid === 0) {
			return undefined;
		}

		let tileset: Tileset | undefined = this.resolvedModel.tilesets.find((t) => t.hasGid(tileGid));
		if (tileset === undefined) {
			throw new Error('something went wrong, hasGid = false for every tileset');
		}
		return tileset.getTileMetadata(tileGid);
	}

	hasTile(layer: number, x: number, y: number): boolean {
		const selectedLayer: TiledLayer | undefined = this.resolvedModel.layers[layer];
		if (selectedLayer === undefined || !selectedLayer.hasData()) {
			return false;
		} else {
			return selectedLayer.hasTile(x, y);
		}
	}

	getTileMetadata(layer: number, tileX: number, tileY: number): TiledMapTileModel {
		if (this.hasTile(layer, tileX, tileY)) {
			const selectedLayer: TiledLayer | undefined = this.resolvedModel.layers[layer];

			return this.getTileMetaDataByGid(selectedLayer.getTileData(tileX, tileY));
		} else {
			return undefined;
		}
	}
}
