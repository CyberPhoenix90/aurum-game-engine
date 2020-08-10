import { SquaredArray } from '../../utilities/data_structures/squared_array';
import { PointLike } from '../../models/point';
import { Projector } from '../../models/common';
import { ArrayDataSource } from 'aurumjs';

export interface BuildingModel {
	gridPosition: PointLike;
	readonly size: PointLike;
}

export class ConstructionGrid<T extends BuildingModel> {
	public readonly buildings: ArrayDataSource<T>;
	private data: SquaredArray<T>;
	private projector: Projector;
	private validPlacementDelegate: (point: PointLike) => boolean;

	constructor(gridArea: SquaredArray<T>, validPlacementDelegate?: (point: PointLike) => boolean, coordinatesProjector?: Projector) {
		this.buildings = new ArrayDataSource([]);
		this.data = gridArea;
		this.projector = coordinatesProjector ?? ((p: PointLike) => p);
		this.validPlacementDelegate = validPlacementDelegate ?? (() => true);
	}

	public hasBuildingAt(point: PointLike): boolean {
		const p = this.projector(point);
		if (p) {
			return this.data.get(p.x, p.y) !== undefined;
		} else {
			return false;
		}
	}

	public getBuildingAt(point: PointLike): T {
		const p = this.projector(point);
		if (p) {
			return this.data.get(p.x, p.y);
		} else {
			return undefined;
		}
	}

	public getBuildingByGridPoint(point: PointLike): T {
		return this.data.get(point.x, point.y);
	}

	public isInBounds(point: PointLike): boolean {
		return point.x >= 0 && point.x < this.data.width && point.y >= 0;
	}

	public canPlace(point: PointLike, size: PointLike): boolean {
		if (!size || !(size.x >= 0) || !(size.y >= 0)) {
			throw new Error('Invalid size');
		}

		if (!this.validPlacementDelegate(point)) {
			return false;
		}

		const p = this.projector(point);
		for (let x = 0; x < size.x; x++) {
			for (let y = 0; y < size.y; y++) {
				if (!this.isInBounds({ x: p.x + x, y: p.y + y })) {
					return false;
				}
				if (this.data.get(p.x + x, p.y + y) !== undefined) {
					return false;
				}
			}
		}

		return true;
	}

	public removeBuilding(building: T): void {
		const p = building.gridPosition;
		this.buildings.remove(building);
		for (let x = 0; x < building.size.x; x++) {
			for (let y = 0; y < building.size.y; y++) {
				this.data.set(p.x + x, p.y + y, undefined);
			}
		}
	}

	public removeBuildingAt(point: PointLike): T {
		const building = this.getBuildingAt(point);
		if (building) {
			this.removeBuilding(building);
		} else {
			return undefined;
		}
	}

	public placeBuilding(point: PointLike, building: T): T {
		if (!this.canPlace(point, building.size)) {
			throw new Error('Cannot place building here');
		} else {
			const p = this.projector(point);
			building.gridPosition = p;
			this.buildings.push(building);
			for (let x = 0; x < building.size.x; x++) {
				for (let y = 0; y < building.size.y; y++) {
					this.data.set(p.x + x, p.y + y, building);
				}
			}
		}
		return building;
	}
}
