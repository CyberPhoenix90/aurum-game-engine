import { DataSource, CancellationToken } from 'aurumjs';
import { Calculation } from '../math/calculation';
import { Unit } from '../math/unit';
import { Position } from '../models/common';
import { CommonEntity } from '../models/entities';
import { SceneGraphNode } from '../models/scene_graph';
import { ScreenHelper } from '../utilities/other/screen_helper';
import { LabelGraphNode } from '../entities/types/label/api';
import { measureStringWidth } from '../entities/types/label/label_entity';
import { SpriteGraphNode } from '../entities/types/sprite/api';
import { CanvasGraphNode } from '../entities/types/canvas/api';

export interface LayoutData {
	x: DataSource<number>;
	y: DataSource<number>;
	sizeX: DataSource<number>;
	sizeY: DataSource<number>;
}

export function layoutAlgorithm(node: SceneGraphNode<CommonEntity>): LayoutData {
	let sizeX: DataSource<number>;
	let sizeY: DataSource<number>;
	let x: DataSource<number>;
	let y: DataSource<number>;

	if (node instanceof SpriteGraphNode || node instanceof CanvasGraphNode) {
		sizeX = node.resolvedModel.width.aggregate(node.onRequestNodeLayoutRefresh, (v) =>
			v === 'auto' ? undefined : computeSize(v, getParentWidth(node), 0, 'x', node.processedChildren?.getData() ?? [])
		);
		sizeY = node.resolvedModel.height.aggregate(node.onRequestNodeLayoutRefresh, (v) =>
			v === 'auto' ? undefined : computeSize(v, getParentHeight(node), 0, 'y', node.processedChildren?.getData() ?? [])
		);
	} else if (node instanceof LabelGraphNode) {
		sizeX = node.resolvedModel.width.aggregateFive(
			node.resolvedModel.text,
			node.resolvedModel.fontSize,
			node.resolvedModel.fontFamily,
			node.resolvedModel.fontWeight,
			(size, text, fs, ff, fw) =>
				size === 'auto'
					? measureStringWidth(text, fw, fs, ff)
					: computeSize(size, getParentWidth(node), 0, 'x', node.processedChildren?.getData() ?? [])
		);

		sizeY = node.resolvedModel.height.aggregate(node.onRequestNodeLayoutRefresh, (v) =>
			v === 'auto' ? node.resolvedModel.fontSize.value : computeSize(v, getParentHeight(node), 0, 'y', node.processedChildren?.getData() ?? [])
		);
	} else {
		sizeX = node.resolvedModel.width.aggregate(node.onRequestNodeLayoutRefresh, (v) =>
			computeSize(v, getParentWidth(node), 0, 'x', node.processedChildren?.getData() ?? [])
		);
		sizeY = node.resolvedModel.height.aggregate(node.onRequestNodeLayoutRefresh, (v) =>
			computeSize(v, getParentHeight(node), 0, 'y', node.processedChildren?.getData() ?? [])
		);
	}

	x = node.resolvedModel.x.aggregate(node.onRequestNodeLayoutRefresh, (v) => {
		return computePosition(v, sizeX.value, node.resolvedModel.originX.value, node.resolvedModel.scaleX.value, getParentWidth(node));
	});

	y = node.resolvedModel.y.aggregate(node.onRequestNodeLayoutRefresh, (v) => {
		return computePosition(v, sizeY.value, node.resolvedModel.originY.value, node.resolvedModel.scaleY.value, getParentHeight(node));
	});

	const result: LayoutData = {
		x,
		y,
		sizeX,
		sizeY
	};

	let parentToken: CancellationToken;
	node.parent.listen((p) => {
		if (parentToken) {
			parentToken.cancel();
			parentToken = undefined;
		}
		if (p) {
			parentToken = new CancellationToken();
			p.renderState.sizeX.listen(() => {
				node.refreshNodeLayoutIfRelative();
			}, parentToken);
			p.renderState.sizeY.listen(() => {
				node.refreshNodeLayoutIfRelative();
			}, parentToken);
		}
		node.refreshNodeLayoutIfRelative();
	});

	node.resolvedModel.originX.listen(() => node.refreshNodeLayout());
	node.resolvedModel.originY.listen(() => node.refreshNodeLayout());
	node.resolvedModel.scaleX.listen(() => node.refreshNodeLayout());
	node.resolvedModel.scaleY.listen(() => node.refreshNodeLayout());

	return result;
}

function getParentWidth(node: SceneGraphNode<CommonEntity>): number {
	return node.parent.value?.resolvedModel.width.value === 'content' ? 0 : node.parent.value?.renderState?.sizeX.value ?? 0;
}

function getParentHeight(node: SceneGraphNode<CommonEntity>): number {
	return node.parent.value?.resolvedModel.height.value === 'content' ? 0 : node.parent.value?.renderState?.sizeY.value ?? 0;
}

function computeSize(value: Position, parentSize: number, distanceToEdge: number, component: 'x' | 'y', children: ReadonlyArray<SceneGraphNode<CommonEntity>>) {
	if (value === undefined) {
		return 0;
	}

	if (value === 'inherit') {
		value = '100%';
	}
	if (value === 'remainder') {
		return distanceToEdge;
	} else if (value === 'content') {
		if (children.length > 0) {
			const sizes = children.map((c) => {
				if (component === 'x') {
					if (c.isSizeXRelative()) {
						return 0;
					} else {
						return c.renderState.positionX.value + (c.renderState.sizeX.value ?? 0);
					}
				} else {
					if (c.isSizeYRelative()) {
						return 0;
					} else {
						return c.renderState.positionY.value + (c.renderState.sizeY.value ?? 0);
					}
				}
			});

			return Math.max(...sizes);
		} else {
			return 0;
		}
	} else {
		if (typeof value === 'number') {
			return value;
		} else if (value.startsWith('calc(')) {
			return new Calculation(value).toPixels(96, parentSize, distanceToEdge);
		} else {
			return new Unit(value).toPixels(96, parentSize);
		}
	}
}

function computePosition(value: Position, size: number, origin: number, scale: number, parentSize: number): number {
	if (value === undefined) {
		return 0;
	}

	let computedValue;
	if (typeof value === 'number') {
		computedValue = value;
	} else {
		if (value.startsWith('calc')) {
			computedValue = new Calculation(value).toPixels(ScreenHelper.PPI, parentSize, 0);
		} else {
			computedValue = new Unit(value).toPixels(ScreenHelper.PPI, parentSize);
		}
	}

	return computedValue - origin * (size ?? 0) * scale;
}
