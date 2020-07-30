import { DataSource, MapDataSource, ArrayDataSource, CancellationToken } from 'aurumjs';
import { SceneGraphNode } from '../models/scene_graph';
import { CommonEntity } from '../models/entities';
import { ContainerGraphNode } from './types/container/api';

export class DataSourceSceneGraphNode extends ContainerGraphNode {
	constructor(dataSource: DataSource<SceneGraphNode<CommonEntity>>) {
		super({
			children: new ArrayDataSource(),
			name: DataSourceSceneGraphNode.name,
			models: {
				userSpecified: {}
			},
			components: new MapDataSource(new Map())
		});

		let cleanUp: CancellationToken;
		dataSource.listenAndRepeat((v) => {
			if (cleanUp) {
				cleanUp.cancel();
			}
			cleanUp = new CancellationToken();
			const subNodes = render(v, rs);
			for (const n of subNodes) {
				if (n.cancellationToken) {
					cleanUp.chain(n.cancellationToken);
				}
			}
		});
	}
}
