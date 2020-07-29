import { NoRenderEntity } from './pixi_no_render_entity';
import { TilesetTypes, TiledLayer, TiledMapRenderModel, TiledMapGraphNode } from 'aurum-game-engine';
import { Container, BaseTexture, Texture } from 'pixi.js';

let CompositeRectTileLayer: any;
export function enableTilemap(compositeRectTileLayer: any) {
	CompositeRectTileLayer = compositeRectTileLayer;
}

export class RenderMapEntity extends NoRenderEntity {
	public displayObject: PIXI.Container;
	private textures: PIXI.Texture[];

	constructor(model: TiledMapGraphNode) {
		super(model);
	}

	protected createTexture(texture: HTMLImageElement) {
		if (!texture) {
			return;
		}
		return new Texture(new BaseTexture(texture));
	}

	private async initialize(model: TiledMapRenderModel): Promise<void> {
		this.textures = [];
		for (const tileset of model.tilesets) {
			if (tileset.getType() === TilesetTypes.TILES) {
				this.textures.push(this.createTexture(await tileset.load()));
			}
		}
		this.buildLayers(model);
	}

	private buildLayers(model: TiledMapRenderModel): void {
		for (let i = 0; i < model.layers.length; i++) {
			this.buildLayer(model, model.layers[i], i);
		}
	}

	private buildLayer(model: TiledMapRenderModel, layerModel: TiledLayer, index: number): void {
		// Since pixi tilemap layers don't act like containers when you place entities in them we have to work around the issue by
		// providing containers between each layer to allow us to add entities that act as if they are child of the layer
		const entitycontainer: Container = new Container();

		//@ts-ignore
		const mapLayer = new CompositeRectTileLayer(index, this.textures, model.mapData.width === layerModel.height);

		if (layerModel.data) {
			switch (model.mapData.orientation) {
				case 'isometric':
					throw new Error('not implemented');
				case 'hexagonal':
					this.buildHexLayer(model, layerModel, mapLayer);
					break;
				case 'orthogonal':
					this.buildOrtLayer(model, layerModel, mapLayer);
					break;
			}
		}

		this.displayObject.addChild(mapLayer);
		this.displayObject.addChild(entitycontainer);
	}

	private buildOrtLayer(model: TiledMapRenderModel, layerModel: TiledLayer, mapLayer: any) {
		layerModel.data.forEach((tileGid: number, index: number) => {
			if (tileGid === 0) {
				return;
			}
			const { tilesetIndex, tileX, tileY } = this.findTileData(model, tileGid);
			const tileWidth = model.tilesets[tilesetIndex].tileWidth;
			const tileHeight = model.tilesets[tilesetIndex].tileHeight;
			const posX = (index % model.mapData.width) * model.mapData.tilewidth;
			const posY = Math.floor(index / model.mapData.width) * model.mapData.tileheight;
			mapLayer.addRect(tilesetIndex, tileX, tileY, posX, posY, tileWidth, tileHeight);
		});
	}

	private buildHexLayer(model: TiledMapRenderModel, layerModel: TiledLayer, mapLayer: any) {
		for (let y = 0; y < model.mapData.height; y++) {
			for (let x = 0; x < model.mapData.width; x += 2) {
				const i = x + model.mapData.width * y;
				this.placeHexTile(model, layerModel.data[i], i, mapLayer);
			}
			for (let x = 1; x < model.mapData.width; x += 2) {
				const i = x + model.mapData.width * y;
				this.placeHexTile(model, layerModel.data[i], i, mapLayer);
			}
		}
	}

	private findTileData(model: TiledMapRenderModel, tileGid: number): { tilesetIndex: number; tileX: number; tileY: number } {
		for (let i: number = 0; i < model.tilesets.length; i++) {
			if (model.tilesets[i].hasGid(tileGid)) {
				let { tileX, tileY } = model.tilesets[i].getTilePosition(tileGid);
				return { tilesetIndex: i, tileX, tileY };
			}
		}

		throw new Error(`cannot find tile ${tileGid}`);
	}

	private placeHexTile(model: TiledMapRenderModel, tileGid: number, index: number, mapLayer: any): void {
		if (tileGid === 0) {
			return;
		}
		const { tilesetIndex, tileX, tileY } = this.findTileData(model, tileGid);
		const tileWidth = model.tilesets[tilesetIndex].tileWidth;
		const tileHeight = model.tilesets[tilesetIndex].tileHeight;

		let posX = 0;
		let posY = 0;

		const indexX = index % model.mapData.width;
		const indexY = Math.floor(index / model.mapData.width);
		const side = (model.mapData.width - model.mapData.hexsidelength) / 2;

		posX = indexX * (side + model.mapData.hexsidelength);
		posY = indexY * model.mapData.tileheight;
		if (indexX % 2 !== 0) {
			posY += model.mapData.tileheight / 2;
		}

		mapLayer.addRect(tilesetIndex, tileX, tileY, posX, posY, tileWidth, tileHeight);
	}

	protected createDisplayObject(model: TiledMapGraphNode) {
		this.initialize(model.renderState);
		return new PIXI.Container();
	}
}
