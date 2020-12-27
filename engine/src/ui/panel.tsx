import { ArrayDataSource, Aurum, AurumComponentAPI, DataSource, dsMap, Renderable } from 'aurumjs';
import { CommonEntity, ContainerEntityProps, Data, SceneGraphNode } from '../aurum-game-engine';
import { AbstractComponent } from '../entities/components/abstract_component';
import { MouseInteractionComponent } from '../entities/components/mouse_interaction_component';
import { Canvas, PaintOperation } from '../entities/types/canvas/canvas_entity';
import { Container } from '../entities/types/container/container_entity';
import { Color } from '../graphics/color';
import { AurumMouse } from '../input/mouse/mouse';
import { Rectangle } from '../math/shapes/rectangle';
import { toSourceIfDefined } from '../utilities/data/to_source';

export interface PanelProps extends ContainerEntityProps {
	mouse: AurumMouse;
	hover?: {
		background?: Data<string | Color>;
		border?: {
			thickness: Data<number>;
			color: Data<string | Color>;
		};
	};
	background?: Data<string | Color>;
	border?: {
		thickness: Data<number>;
		color: Data<string | Color>;
	};
	margin?:
		| Data<number>
		| {
				top?: Data<number>;
				left?: Data<number>;
				right?: Data<number>;
				bottom?: Data<number>;
		  };
	padding?:
		| Data<number>
		| {
				top?: Data<number>;
				left?: Data<number>;
		  };
	onClick?(e: { e: MouseEvent; source: SceneGraphNode<CommonEntity> }): void;
	onMouseDown?(e: { e: MouseEvent; source: SceneGraphNode<CommonEntity> }): void;
	onMouseUp?(e: { e: MouseEvent; source: SceneGraphNode<CommonEntity> }): void;
	onMouseMove?(e: { e: MouseEvent; source: SceneGraphNode<CommonEntity> }): void;
	onMouseEnter?(e: { e: MouseEvent; source: SceneGraphNode<CommonEntity> }): void;
	onMouseLeave?(e: { e: MouseEvent; source: SceneGraphNode<CommonEntity> }): void;
	onScroll?(e: { e: WheelEvent; source: SceneGraphNode<CommonEntity> }): void;
}

export function Panel(props: PanelProps, children: Renderable[], api: AurumComponentAPI): Renderable {
	const isSimpleMargin = typeof props.margin === 'number' || props.margin instanceof DataSource;
	const isSimplePadding = typeof props.padding === 'number' || props.padding instanceof DataSource;
	const hover = new DataSource(false);

	const marginLeft = toSourceIfDefined((props.margin as any)?.left ?? (isSimpleMargin ? (props.margin as Data<number>) : undefined)) ?? new DataSource(0);
	const marginTop = toSourceIfDefined((props.margin as any)?.top ?? (isSimpleMargin ? (props.margin as Data<number>) : undefined)) ?? new DataSource(0);
	const marginRight = toSourceIfDefined((props.margin as any)?.right ?? (isSimpleMargin ? (props.margin as Data<number>) : undefined)) ?? new DataSource(0);
	const marginBottom = toSourceIfDefined((props.margin as any)?.bottom ?? (isSimpleMargin ? (props.margin as Data<number>) : undefined)) ?? new DataSource(0);

	const paddingTop = toSourceIfDefined((props.padding as any)?.top ?? (isSimplePadding ? (props.padding as Data<number>) : undefined)) ?? new DataSource(0);
	const paddingLeft = toSourceIfDefined((props.padding as any)?.left ?? (isSimplePadding ? (props.padding as Data<number>) : undefined)) ?? new DataSource(0);

	const horizontalMargin = marginLeft.aggregate([marginRight], (a, b) => a + b);
	const verticalMargin = marginTop.aggregate([marginBottom], (a, b) => a + b);

	let borderThickness = toSourceIfDefined(props.border?.thickness) ?? new DataSource(0);
	let borderColor = toSourceIfDefined(props.border?.color) ?? new DataSource('transparent');

	if (props.hover?.border?.thickness) {
		borderThickness = borderThickness.aggregate([toSourceIfDefined(props.hover.border.thickness), hover], (bt, hbt, h) => (h ? hbt : bt));
	}

	if (props.hover?.border?.color) {
		borderColor = borderColor.aggregate([toSourceIfDefined(props.hover.border.color), hover], (bc, hbc, h) => (h ? hbc : bc));
	}

	let background = toSourceIfDefined(props.background) ?? new DataSource<string | Color>(undefined);
	if (props.hover?.background) {
		background = background.aggregate([toSourceIfDefined(props.hover.background), hover], (bg, hbg, h) => (h ? hbg : bg));
	}

	const drawing = new ArrayDataSource<PaintOperation>();

	const x = props.x;
	const y = props.y;
	const originX = props.originX;
	const originY = props.originY;
	delete props.x;
	delete props.y;
	delete props.originX;
	delete props.originY;

	return (
		<Container x={x} y={y} originX={originX} originY={originY} name="Panel">
			<Container
				y={paddingTop.aggregate([borderThickness], (a, b) => a + b)}
				x={paddingLeft.aggregate([borderThickness], (a, b) => a + b)}
				components={[createMouseComponent(props, hover)]}
				name="PanelInternal"
				width={horizontalMargin.transform(dsMap((m) => `content + ${m}px`))}
				height={verticalMargin.transform(dsMap((m) => `content + ${m}px`))}
				onAttach={(node) => {
					node.renderState.width.aggregate(
						[node.renderState.height, borderThickness, borderColor, background],
						(width, height, bt, bc, bg) => {
							drawing.clear();
							if (bt && bc) {
								let color: string;
								if (typeof bc === 'string') {
									color = bc;
								} else {
									color = bc.toRGBA();
								}
								drawing.push({
									fillStyle: color,
									shape: new Rectangle({ x: -bt, y: -bt }, { x: width + bt * 2, y: bt })
								});
								drawing.push({
									fillStyle: color,
									shape: new Rectangle({ x: -bt, y: 0 }, { x: bt, y: height + bt })
								});
								drawing.push({
									fillStyle: color,
									shape: new Rectangle({ x: width, y: 0 }, { x: bt, y: height + bt })
								});
								drawing.push({
									fillStyle: color,
									shape: new Rectangle({ x: 0, y: height }, { x: width, y: bt })
								});
							}
							if (bg) {
								const draw: PaintOperation = {};
								if (typeof bg === 'string') {
									draw.fillStyle = bg;
								} else {
									draw.fillStyle = bg.toRGBA();
								}
								draw.shape = new Rectangle({ x: 0, y: 0 }, { x: width, y: height });
								drawing.push(draw);
							}
						},
						api.cancellationToken
					);
				}}
			>
				<Canvas width={0} height={0} name="PanelBackground" paintOperations={drawing}></Canvas>
				<Container name="PanelContent" x={marginLeft} y={marginTop} {...props}>
					{children}
				</Container>
			</Container>
		</Container>
	);
}
function createMouseComponent(props: PanelProps, hover: DataSource<boolean>): AbstractComponent {
	return new MouseInteractionComponent({
		mouse: props.mouse,
		onClick: props.onClick,
		onMouseDown: props.onMouseDown,
		onMouseEnter: (e) => {
			hover.update(true);
			props.onMouseEnter?.(e);
		},
		onMouseLeave: (e) => {
			hover.update(false);
			props.onMouseLeave?.(e);
		},
		onMouseMove: props.onMouseMove,
		onMouseUp: props.onMouseUp,
		onScroll: props.onScroll
	});
}
