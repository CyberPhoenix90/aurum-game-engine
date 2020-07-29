import { CommonEntity } from '../../../models/entities';
import { DataSource } from 'aurumjs';
import { ReadOnlyDataSource } from 'aurumjs';
import { EntityRenderModel } from '../../../rendering/model';

export interface CameraEntity extends CommonEntity {
	resolutionX?: DataSource<number>;
	resolutionY?: DataSource<number>;
	backgroundColor?: DataSource<string>;
}

export interface CameraEntityRenderModel extends EntityRenderModel {
	view: HTMLElement;
	backgroundColor: ReadOnlyDataSource<string>;
}
