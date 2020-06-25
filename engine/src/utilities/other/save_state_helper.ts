import { DataSource, ArrayDataSource, DuplexDataSource } from 'aurumjs';

export type Serializable = string | string[] | number | number[] | { [key: string]: Serializable };

class SaveStateHelper {
	private streams: { [key: string]: DataSource<Serializable> | ArrayDataSource<Serializable> | DuplexDataSource<Serializable> };

	constructor() {
		this.streams = {};
	}

	private serializeState(): string {
		const data = {};
		for (const key in this.streams) {
			const stream = this.streams[key];
			if (stream instanceof ArrayDataSource) {
				data[key] = stream.toArray();
			} else {
				if (typeof stream.value === 'object') {
					data[key] = JSON.parse(JSON.stringify(stream.value));
				} else {
					data[key] = stream.value;
				}
			}
		}

		return JSON.stringify(data);
	}

	public registerDataSource(uuid: string | number, source: DataSource<Serializable> | ArrayDataSource<Serializable> | DuplexDataSource<Serializable>): void {
		this.streams[uuid] = source;
	}

	public saveState(key: string): void {
		localStorage.setItem(key, this.serializeState());
	}

	public loadState(key: string): boolean {
		const item = localStorage.getItem(key);
		if (item) {
			const data = JSON.parse(item);
			for (const key in data) {
				if (key in this.streams) {
					const stream = this.streams[key];
					if (stream instanceof ArrayDataSource) {
						stream.merge(data[key]);
					} else if (stream instanceof DataSource) {
						stream.update(data[key]);
					} else if (stream instanceof DuplexDataSource) {
						stream.updateUpstream(data[key]);
					}
				}
			}

			return true;
		} else {
			return false;
		}
	}
}

export const saveStateHelper = new SaveStateHelper();
