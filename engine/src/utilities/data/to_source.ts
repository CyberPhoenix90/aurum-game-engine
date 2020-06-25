import { DataSource } from 'aurumjs';
import { Data } from '../../models/input_data';

export function toSource<T>(value: Data<T>, defaultValue: T): DataSource<T> {
	if (value === undefined) {
		return new DataSource(defaultValue);
	} else if (value instanceof DataSource) {
		return value;
	} else {
		return new DataSource(value as T);
	}
}
