import { Color, LabelEntityRenderModel } from 'aurum-game-engine';
import { Text } from 'pixi.js';
import { NoRenderEntity } from './pixi_no_render_entity';

export class RenderLabelEntity extends NoRenderEntity {
	public displayObject: Text;

	constructor(model: LabelEntityRenderModel) {
		super(model);
	}

	protected createDisplayObject(model: LabelEntityRenderModel) {
		const result = new Text('');
		result.resolution = 2;
		return result;
	}

	public bind(model: LabelEntityRenderModel) {
		model.text.listenAndRepeat((v) => {
			updateText.call(this, v.substring(0, model.renderCharCount.value));
		}, this.token);

		model.renderCharCount.listenAndRepeat((v) => {
			updateText.call(this, model.text.value.substring(0, v));
		}, this.token);

		model.color.listenAndRepeat((v) => {
			this.displayObject.style.fill = Color.fromString(v ?? 'white').toRGBNumber();
		}, this.token);

		model.fontSize.listenAndRepeat((v) => {
			this.displayObject.style.fontSize = v === undefined ? 16 : v;
		}, this.token);

		model.fontFamily.listenAndRepeat((v) => {
			this.displayObject.style.fontFamily = v === undefined ? 'Arial' : v;
		}, this.token);

		model.fontWeight.listenAndRepeat((v) => {
			this.displayObject.style.fontWeight = v ? v : '';
		}, this.token);

		model.fontStyle.listenAndRepeat((v) => {
			this.displayObject.style.fontStyle = v ? v : '';
		}, this.token);

		model.dropShadow.listenAndRepeat((v) => {
			this.displayObject.style.dropShadow = v;
		}, this.token);

		model.dropShadowAngle.listenAndRepeat((v) => {
			this.displayObject.style.dropShadowAngle = v;
		}, this.token);

		model.dropShadowColor.listenAndRepeat((v) => {
			this.displayObject.style.dropShadowColor = v ? Color.fromString(v).toRGBANumber() : undefined;
		}, this.token);

		model.dropShadowDistance.listenAndRepeat((v) => {
			this.displayObject.style.dropShadowDistance = v;
		}, this.token);

		model.dropShadowFuzziness.listenAndRepeat((v) => {
			this.displayObject.style.dropShadowBlur = v;
		}, this.token);

		model.textBaseline.listenAndRepeat((v) => {
			this.displayObject.style.textBaseline = v;
		}, this.token);

		model.stroke.listenAndRepeat((v) => {
			this.displayObject.style.stroke = v;
		}, this.token);

		model.strokeThickness.listenAndRepeat((v) => {
			this.displayObject.style.strokeThickness = v === undefined ? 1 : v;
		}, this.token);

		function updateText(text: string): void {
			this.displayObject.text = text;
		}

		super.bind(model);
	}
}
