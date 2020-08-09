import { CommonEntity } from '../models/entities';
import { DataSource, ArrayDataSource } from 'aurumjs';

export const entityDefaults: CommonEntity = {
	alpha: new DataSource(1),
	blendMode: new DataSource(undefined),
	clip: new DataSource(false),
	x: new DataSource(0),
	y: new DataSource(0),
	width: new DataSource(0),
	height: new DataSource(0),
	layout: new DataSource(undefined),
	ignoreLayout: new DataSource(false),
	marginBottom: new DataSource(0),
	marginTop: new DataSource(0),
	marginLeft: new DataSource(0),
	marginRight: new DataSource(0),
	originX: new DataSource(0),
	originY: new DataSource(0),
	scaleX: new DataSource(1),
	scaleY: new DataSource(1),
	shaders: new ArrayDataSource([]),
	visible: new DataSource(true),
	spreadLayout: new DataSource(false),
	maxHeight: new DataSource(undefined),
	maxWidth: new DataSource(undefined),
	minHeight: new DataSource(undefined),
	minWidth: new DataSource(undefined),
	zIndex: new DataSource(undefined)
};