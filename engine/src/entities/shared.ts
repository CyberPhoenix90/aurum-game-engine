import { ArrayDataSource } from 'aurumjs';
import { Constructor } from '../models/common';
import { AbstractComponent } from './components/abstract_component';

export function getComponentByTypeFactory(components: ArrayDataSource<AbstractComponent>): (type: any) => any {
	return (type: Constructor<any>) => {
		return components.getData().find((c) => Object.getPrototypeOf(c).constructor === type);
	};
}
