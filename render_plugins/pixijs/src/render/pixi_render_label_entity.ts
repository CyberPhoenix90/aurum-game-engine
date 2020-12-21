import { Color, LabelGraphNode } from 'aurum-game-engine';
import { Text } from 'pixi.js';
import { NoRenderEntity } from './pixi_no_render_entity';

export class RenderLabelEntity extends NoRenderEntity {
	public displayObject: Text;

	constructor(model: LabelGraphNode) {
		super(model);
	}

	protected createDisplayObject(model: LabelGraphNode) {
		const result = new Text('');
		result.resolution = 2;
		return result;
	}

	public bind(model: LabelGraphNode) {
		model.resolvedModel.width.listenAndRepeat((v) => {
			if (v === 'auto') {
				model.renderState.sizeX.update(this.displayObject.width);
			}
		});

		model.resolvedModel.height.listenAndRepeat((v) => {
			if (v === 'auto') {
				model.renderState.sizeY.update(this.displayObject.height);
			}
		});

		model.renderState.text.listenAndRepeat((v) => {
			updateText.call(this, v.substring(0, model.renderState.renderCharCount.value));
			this.updateSize(model);
		}, this.token);

		model.renderState.renderCharCount.listenAndRepeat((v) => {
			updateText.call(this, model.renderState.text.value.substring(0, v));
			this.updateSize(model);
		}, this.token);

		model.renderState.color.listenAndRepeat((v) => {
			this.displayObject.style.fill = Color.fromString(v ?? 'white').toRGBNumber();
		}, this.token);

		model.renderState.fontSize.listenAndRepeat((v) => {
			this.displayObject.style.fontSize = v === undefined ? 16 : v;
			this.updateSize(model);
		}, this.token);

		model.renderState.fontFamily.listenAndRepeat((v) => {
			this.displayObject.style.fontFamily = v === undefined ? 'Arial' : v;
			this.updateSize(model);
		}, this.token);

		model.renderState.fontWeight.listenAndRepeat((v) => {
			this.displayObject.style.fontWeight = v ? v : '';
			this.updateSize(model);
		}, this.token);

		model.renderState.fontStyle.listenAndRepeat((v) => {
			this.displayObject.style.fontStyle = v ? v : '';
			this.updateSize(model);
		}, this.token);

		model.renderState.dropShadow.listenAndRepeat((v) => {
			this.displayObject.style.dropShadow = v;
		}, this.token);

		model.renderState.dropShadowAngle.listenAndRepeat((v) => {
			this.displayObject.style.dropShadowAngle = v;
		}, this.token);

		model.renderState.dropShadowColor.listenAndRepeat((v) => {
			this.displayObject.style.dropShadowColor = v ? Color.fromString(v).toRGBANumber() : undefined;
		}, this.token);

		model.renderState.dropShadowDistance.listenAndRepeat((v) => {
			this.displayObject.style.dropShadowDistance = v;
		}, this.token);

		model.renderState.dropShadowFuzziness.listenAndRepeat((v) => {
			this.displayObject.style.dropShadowBlur = v;
		}, this.token);

		model.renderState.textBaseline.listenAndRepeat((v) => {
			this.displayObject.style.textBaseline = v;
		}, this.token);

		model.renderState.stroke.listenAndRepeat((v) => {
			this.displayObject.style.stroke = v;
		}, this.token);

		model.renderState.strokeThickness.listenAndRepeat((v) => {
			this.displayObject.style.strokeThickness = v === undefined ? 1 : v;
			this.updateSize(model);
		}, this.token);

		function updateText(text: string): void {
			this.displayObject.text = text;
		}

		super.bind(model);
	}

	private updateSize(model: LabelGraphNode) {
		if (model.resolvedModel.width.value === 'auto') {
			model.renderState.sizeX.update(this.displayObject.width);
			model.onRequestNodeLayoutRefresh.update();
		}

		if (model.resolvedModel.height.value === 'auto') {
			model.renderState.sizeY.update(this.displayObject.height);
			model.onRequestNodeLayoutRefresh.update();
		}
	}
}
