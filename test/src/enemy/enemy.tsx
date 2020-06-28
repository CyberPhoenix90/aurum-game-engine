import { CommonEntity, Container, ContainerEntity, EntityRenderModel, PathFollowingComponent, Polygon, SceneGraphNode, Sprite } from 'aurum-game-engine';
import { Aurum, AurumComponentAPI, Renderable } from 'aurumjs';

export interface EnemyProps {
	path: Polygon;
	onAttach?(node: SceneGraphNode<CommonEntity>, renderModel: EntityRenderModel): void;
	onDetach?(node: SceneGraphNode<CommonEntity>, renderModel: EntityRenderModel): void;
	onReachEndOfPath(): void;
}

export function Enemy(props: EnemyProps, children: Renderable[], api: AurumComponentAPI): SceneGraphNode<ContainerEntity> {
	const pathfollowing = new PathFollowingComponent({
		speed: 6
	});
	pathfollowing.followPath(props.path).then(() => {
		if (!api.cancellationToken.isCanceled) {
			props.onReachEndOfPath();
		}
	});

	return (
		<Container
			onAttach={props.onAttach}
			onDetach={props.onDetach}
			components={[pathfollowing]}
			width={48}
			height={48}
			x={props.path.points[0].x}
			y={props.path.points[0].y}
		>
			<Sprite width={48} height={48} texture="assets/enemy.png"></Sprite>
		</Container>
	);
}
