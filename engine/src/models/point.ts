import { ReadonlyData, Data } from './input_data';

export type ReadonlyPointLikeData =
	| {
			x: ReadonlyData<number>;
			y: ReadonlyData<number>;
	  }
	| ReadonlyData<Readonly<{ x: number; y: number }>>;

export type PointLikeData =
	| {
			x: Data<number>;
			y: Data<number>;
	  }
	| { x: number; y: number };

export interface PointLike {
	x: number;
	y: number;
}
