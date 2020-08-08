import { DataSource } from 'aurumjs';
import { Calculation } from '../math/calculation';
import { Unit } from '../math/unit';
import { Position } from '../models/common';
import { CommonEntity } from '../models/entities';
import { SceneGraphNode } from '../models/scene_graph';
import { ScreenHelper } from '../utilities/other/screen_helper';
import { LabelGraphNode } from '../entities/types/label/api';
import { measureStringWidth } from '../entities/types/label/label_entity';
import { SpriteGraphNode } from '../entities/types/sprite/api';

export interface LayoutData {
	x: DataSource<number>;
	y: DataSource<number>;
	sizeX: DataSource<number>;
	sizeY: DataSource<number>;
}

export function layoutAlgorithm(node: SceneGraphNode<any>): LayoutData {
	let sizeX: DataSource<number>;
	let sizeY: DataSource<number>;
	let x: DataSource<number>;
	let y: DataSource<number>;

	if (node instanceof SpriteGraphNode) {
		sizeX = node.resolvedModel.width.map((v) => (v === 'auto' ? undefined : computeSize(v)));
		sizeY = node.resolvedModel.height.map((v) => (v === 'auto' ? undefined : computeSize(v)));
	} else if (node instanceof LabelGraphNode) {
		sizeX = node.resolvedModel.width.aggregateFive(
			node.resolvedModel.text,
			node.resolvedModel.fontSize,
			node.resolvedModel.fontFamily,
			node.resolvedModel.fontWeight,
			(size, text, fs, ff, fw) => (size === 'auto' ? measureStringWidth(text, fw, fs, ff) : computeSize(size))
		);

		sizeY = node.resolvedModel.height.map((v) => (v === 'auto' ? node.resolvedModel.fontSize.value : computeSize(v)));
	} else {
		sizeX = node.resolvedModel.width.map((v) => computeSize(v));
		sizeY = node.resolvedModel.height.map((v) => computeSize(v));
	}

	x = node.resolvedModel.x.map((v) => {
		return computePosition(node, v, sizeX, node.resolvedModel.originX, node.resolvedModel.scaleX, node.parent?.renderState?.sizeX ?? new DataSource(0));
	});

	y = node.resolvedModel.y.map((v) => {
		return computePosition(node, v, sizeY, node.resolvedModel.originY, node.resolvedModel.scaleY, node.parent?.renderState?.sizeY ?? new DataSource(0));
	});

	const result: LayoutData = {
		x,
		y,
		sizeX,
		sizeY
	};

	return result;
}

function computeSize(value: Position) {
	if (value === 'content') {
		return 0;
	} else {
		return value === undefined ? undefined : parseInt(value.toString());
	}
}

function computePosition(
	node: SceneGraphNode<CommonEntity>,
	value: Position,
	size: DataSource<number>,
	origin: DataSource<number>,
	scale: DataSource<number>,
	parentSize: DataSource<number>
): number {
	let computedValue;
	if (typeof value === 'number') {
		computedValue = value;
	} else {
		if (value.startsWith('calc')) {
			// dependOnParentSize(node);
			computedValue = new Calculation(value).toPixels(ScreenHelper.PPI, parentSize.value, 0);
		} else {
			// dependOnParentSize(node);
			computedValue = new Unit(value).toPixels(ScreenHelper.PPI, parentSize.value);
		}
	}

	return computedValue - origin.value * (size.value ?? 0) * scale.value;
}
