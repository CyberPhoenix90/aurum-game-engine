import { ArrayDataSource, DataSource, MapDataSource } from 'aurumjs';
import { AbstractComponent } from '../entities/components/abstract_component';
import { MapLike, Position } from '../models/common';
import { Data } from '../models/input_data';
import { SceneGraphNode } from './scene_graph';
import { Constructor } from 'aurumjs/dist/utilities/common';
import { AbstractLayout } from '../layouts/abstract_layout';

export interface Shader {
	vertex?: string;
	fragment?: string;
	uniforms?: ShaderUniforms;
}

export type ShaderUniforms = MapLike<boolean | number | number[]>;

export interface CommonEntityProps {
	x?: Data<Position>;
	y?: Data<Position>;
	originX?: Data<number>;
	originY?: Data<number>;
	clip?: Data<boolean>;
	ignoreLayout?: Data<boolean>;
	spreadLayout?: Data<boolean>;
	zIndex?: Data<number>;
	shaders?: Shader[] | ArrayDataSource<Shader>;
	blendMode?: Data<BlendModes>;
	marginTop?: Data<number>;
	marginRight?: Data<number>;
	marginBottom?: Data<number>;
	marginLeft?: Data<number>;
	minWidth?: Data<Position | 'content' | 'inherit' | 'remainder'>;
	minHeight?: Data<Position | 'content' | 'inherit' | 'remainder'>;
	width?: Data<Position | 'content' | 'inherit' | 'remainder'>;
	maxWidth?: Data<Position | 'content' | 'inherit' | 'remainder'>;
	maxHeight?: Data<Position | 'content' | 'inherit' | 'remainder'>;
	height?: Data<Position | 'content' | 'inherit' | 'remainder'>;
	scaleX?: Data<number>;
	scaleY?: Data<number>;
	visible?: Data<boolean>;
	alpha?: Data<number>;
	components?: MapDataSource<Constructor<AbstractComponent>, AbstractComponent> | AbstractComponent[];
	class?: CommonEntity[] | ArrayDataSource<CommonEntity>;
	name?: string;
	layout?: AbstractLayout | DataSource<AbstractLayout>;
	onAttach?(node: SceneGraphNode<CommonEntity>): void;
	onDetach?(node: SceneGraphNode<CommonEntity>): void;
}

export interface CommonEntity {
	x?: DataSource<Position>;
	y?: DataSource<Position>;
	originX?: DataSource<number>;
	originY?: DataSource<number>;
	clip?: DataSource<boolean>;
	marginTop?: DataSource<number>;
	marginRight?: DataSource<number>;
	marginBottom?: DataSource<number>;
	marginLeft?: DataSource<number>;
	layout?: DataSource<AbstractLayout>;
	ignoreLayout?: DataSource<boolean>;
	spreadLayout?: DataSource<boolean>;
	zIndex?: DataSource<number>;
	scaleX?: DataSource<number>;
	scaleY?: DataSource<number>;
	shaders?: ArrayDataSource<Shader>;
	blendMode?: DataSource<BlendModes>;
	minWidth?: DataSource<Position | 'content' | 'inherit' | 'remainder'>;
	minHeight?: DataSource<Position | 'content' | 'inherit' | 'remainder'>;
	width?: DataSource<Position | 'content' | 'inherit' | 'remainder'>;
	maxWidth?: DataSource<Position | 'content' | 'inherit' | 'remainder'>;
	maxHeight?: DataSource<Position | 'content' | 'inherit' | 'remainder'>;
	height?: DataSource<Position | 'content' | 'inherit' | 'remainder'>;
	visible?: DataSource<boolean>;
	alpha?: DataSource<number>;
	//layout?: ReadonlyData<AbstractLayout>;
}

export enum RenderableType {
	NO_RENDER,
	SPRITE,
	BOX_SPRITE,
	LABEL,
	CAMERA,
	CANVAS,
	TILE_MAP,
	TILED_SPRITE
}

export enum BlendModes {
	NORMAL,
	ADD,
	SUB,
	MULTIPLY
}
