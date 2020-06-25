import { Unit } from '../math/unit';
import { DataSource } from 'aurumjs';
import { PointLike } from './point';

export type Size = number | string | Unit | DataSource<number>;

export type Radian = number;
export type Degrees = number;
export type MapLike<T> = { [key: string]: T };
export type Constructor<T> = new (...args: any[]) => T;
export type Projector = (p: PointLike) => PointLike;

export enum DIRECTION4 {
	UP = 'UP',
	RIGHT = 'RIGHT',
	DOWN = 'DOWN',
	LEFT = 'LEFT'
}

export enum SIDE {
	TOP = 'TOP',
	RIGHT = 'RIGHT',
	BOTTOM = 'BOTTOM',
	LEFT = 'LEFT'
}

export enum DIRECTION8 {
	UP = 'UP',
	UP_RIGHT = 'UP_RIGHT',
	RIGHT = 'RIGHT',
	DOWN_RIGHT = 'DOWN_RIGHT',
	DOWN = 'DOWN',
	DOWN_LEFT = 'DOWN_LEFT',
	LEFT = 'LEFT',
	UP_LEFT = 'UP_LEFT'
}

export enum DIRECTION9 {
	UP = 'UP',
	UP_RIGHT = 'UP_RIGHT',
	RIGHT = 'RIGHT',
	DOWN_RIGHT = 'DOWN_RIGHT',
	DOWN = 'DOWN',
	DOWN_LEFT = 'DOWN_LEFT',
	LEFT = 'LEFT',
	UP_LEFT = 'UP_LEFT',
	CENTER = 'CENTER'
}

export enum ROTATION_DIRECTION {
	CLOCKWISE = 'CLOCKWISE',
	ANTI_CLOCKWISE = 'ANTI_CLOCKWISE'
}
