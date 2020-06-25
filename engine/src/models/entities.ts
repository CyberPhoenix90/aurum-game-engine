import { ArrayDataSource, DataSource } from 'aurumjs';
import { AbstractComponent } from '../entities/components/abstract_component';
import { Size } from '../models/common';
import { Data } from '../models/input_data';

export interface CommonEntityProps extends CommonEntityApiProps {
	x?: Data<Size | 'center' | 'left' | 'right'>;
	y?: Data<Size | 'center' | 'top' | 'bottom'>;
	originX?: Data<number>;
	originY?: Data<number>;
	clip?: Data<boolean>;
	ignoreLayout?: Data<boolean>;
	spreadLayout?: Data<boolean>;
	zIndex?: Data<number>;
	//fragmentShaders?: FragmentShader[];
	blendMode?: Data<BlendModes>;
	marginTop?: Data<number>;
	marginRight?: Data<number>;
	marginBottom?: Data<number>;
	marginLeft?: Data<number>;
	minWidth?: Data<Size | 'content' | 'inherit' | 'remainder'>;
	minHeight?: Data<Size | 'content' | 'inherit' | 'remainder'>;
	width?: Data<Size | 'content' | 'inherit' | 'remainder'>;
	maxWidth?: Data<Size | 'content' | 'inherit' | 'remainder'>;
	maxHeight?: Data<Size | 'content' | 'inherit' | 'remainder'>;
	height?: Data<Size | 'content' | 'inherit' | 'remainder'>;
	visible?: Data<boolean>;
	alpha?: Data<number>;
	components?: ArrayDataSource<AbstractComponent> | AbstractComponent[];
	//class?: StyleClass<any>[];
	name?: string;
	//layout?: ReadonlyData<AbstractLayout>;
}

export interface CommonEntity {
	x: DataSource<Size | 'center' | 'left' | 'right'>;
	y: DataSource<Size | 'center' | 'top' | 'bottom'>;
	originX: DataSource<number>;
	originY: DataSource<number>;
	clip: DataSource<boolean>;
	marginTop: DataSource<number>;
	marginRight: DataSource<number>;
	marginBottom: DataSource<number>;
	marginLeft: DataSource<number>;
	ignoreLayout: DataSource<boolean>;
	spreadLayout: DataSource<boolean>;
	zIndex: DataSource<number>;
	//fragmentShaders?: FragmentShader[];
	blendMode: DataSource<BlendModes>;
	minWidth: DataSource<Size | 'content' | 'inherit' | 'remainder'>;
	minHeight: DataSource<Size | 'content' | 'inherit' | 'remainder'>;
	width: DataSource<Size | 'content' | 'inherit' | 'remainder'>;
	maxWidth: DataSource<Size | 'content' | 'inherit' | 'remainder'>;
	maxHeight: DataSource<Size | 'content' | 'inherit' | 'remainder'>;
	height: DataSource<Size | 'content' | 'inherit' | 'remainder'>;
	visible: DataSource<boolean>;
	alpha: DataSource<number>;
	components: ArrayDataSource<AbstractComponent>;
	//class?: StyleClass<any>[];
	name: string;
	//layout?: ReadonlyData<AbstractLayout>;
}

export interface CommonEntityApiProps {
	onAttach?(): void;
	onDetach?(): void;
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
