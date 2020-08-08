import { SceneGraphNode } from '../aurum_game_engine';
import { CommonEntity } from '../models/entities';

export abstract class AbstractLayout {
	public positionChildren(entities: ReadonlyArray<SceneGraphNode<CommonEntity>>, relative: SceneGraphNode<CommonEntity>): void {
		entities.forEach((e, i) => this.positionEntityByIndex(e, i, entities, relative));
	}

	public abstract isSizeSensitive(): boolean;

	public abstract positionEntityByIndex(
		entity: SceneGraphNode<CommonEntity>,
		index: number,
		entities: ReadonlyArray<SceneGraphNode<CommonEntity>>,
		relative: SceneGraphNode<CommonEntity>
	): void;
}
