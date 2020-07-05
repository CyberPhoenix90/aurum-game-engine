import { EntityRenderModel } from 'aurum-game-engine';
import { ArrayDataSource, DataSource } from 'aurumjs';

export const lives = new DataSource(15);
export const enemiesData: ArrayDataSource<EntityRenderModel> = new ArrayDataSource();
export const bullets = new ArrayDataSource([]);
