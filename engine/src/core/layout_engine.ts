import { DataSource, CancellationToken } from 'aurumjs';
import { CommonEntity, RenderableType } from '../models/entities';
import { EntityRenderModel } from '../rendering/model';
import { Size } from '../models/common';
import { Calculation } from '../math/calculation';
import { ScreenHelper } from '../utilities/other/screen_helper';
import { Unit } from '../math/unit';
import { SceneGraphNode } from '../models/scene_graph';
import { LabelEntity, measureStringWidth } from '../entities/label_entity';

export interface LayoutData {
	x: DataSource<number>;
	y: DataSource<number>;
	sizeX: DataSource<number>;
	sizeY: DataSource<number>;
}

export function layoutAlgorithm(node: SceneGraphNode<CommonEntity>, parentRenderModel?: EntityRenderModel): LayoutData {
	let sizeX: DataSource<number>;
	let sizeY: DataSource<number>;
	let x: DataSource<number>;
	let y: DataSource<number>;

	setDefaults(node);

	if (node.nodeType === RenderableType.LABEL) {
		sizeX = node.model.width.aggregateFour(
			(node.model as LabelEntity).text,
			(node.model as LabelEntity).fontSize,
			(node.model as LabelEntity).fontFamily,
			(size, text, fs, ff) => (size === undefined ? measureStringWidth(text, (node.model as LabelEntity).fontWeight.value, fs, ff) : computeSize(size))
		);
		sizeY = node.model.height.map((v) => computeSize(v));
	} else {
		sizeX = node.model.width.map((v) => computeSize(v));
		sizeY = node.model.height.map((v) => computeSize(v));
	}

	let xPosToken = new CancellationToken();
	x = node.model.x.map((v) => {
		if (xPosToken.hasCancellables()) {
			xPosToken.cancel();
			xPosToken = new CancellationToken();
		}
		return computePosition(v, sizeX, node.model.originX, node.model.scaleX, xPosToken, parentRenderModel?.sizeX ?? new DataSource(0));
	});

	let yPosToken = new CancellationToken();
	y = node.model.y.map((v) => {
		if (yPosToken.hasCancellables()) {
			yPosToken.cancel();
			yPosToken = new CancellationToken();
		}
		return computePosition(v, sizeY, node.model.originY, node.model.scaleY, yPosToken, parentRenderModel?.sizeY ?? new DataSource(0));
	});

	const result: LayoutData = {
		x,
		y,
		sizeX,
		sizeY
	};

	return result;
}

function setDefaults(node: SceneGraphNode<CommonEntity>) {
	if (node.nodeType === RenderableType.NO_RENDER) {
		if (node.model.width.value === undefined) {
			node.model.width.update('content');
		}
		if (node.model.height.value === undefined) {
			node.model.height.update('content');
		}
	}
}

function computeSize(value: Size) {
	if (value === 'content') {
		return 0;
	} else {
		return value === undefined ? undefined : parseInt(value.toString());
	}
}

function computePosition(
	value: Size,
	size: DataSource<number>,
	origin: DataSource<number>,
	scale: DataSource<number>,
	token: CancellationToken,
	parentSize: DataSource<number>
): number {
	let computedValue;
	if (typeof value === 'number') {
		computedValue = value;
	} else {
		if (value.startsWith('calc')) {
			computedValue = new Calculation(value).toPixels(ScreenHelper.PPI, parentSize.value, 0);
		} else {
			computedValue = new Unit(value).toPixels(ScreenHelper.PPI, parentSize.value);
		}
	}

	return computedValue - origin.value * (size.value ?? 0) * scale.value;
}
