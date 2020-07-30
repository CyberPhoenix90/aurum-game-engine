import {, ArrayDataSource, MapDataSource } from "aurumjs";
import { SceneGraphNode } from "../models/scene_graph";
import { CommonEntity } from "../models/entities";
import { ContainerGraphNode } from "./types/container/api";

export class ArrayDataSourceSceneGraphNode extends ContainerGraphNode {
    constructor(dataSource:ArrayDataSource<SceneGraphNode<CommonEntity>>) {
		super({
			children: dataSource,
			name: ArrayDataSourceSceneGraphNode.name,
			models: {
				userSpecified: {}
			},
			components: new MapDataSource(new Map())
		});

    }
}