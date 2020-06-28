import { Moment } from './moment';
import { CancellationToken, DataSource } from 'aurumjs';
import { onBeforeRender } from '../../core/stage';

export interface ClockConfig {
	timestamp?: number;
	speed?: number;
	autoStart?: boolean;
}

export class Clock extends Moment {
	public speed: number;

	public hourSource: DataSource<number>;
	public minuteSource: DataSource<number>;
	public secondSource: DataSource<number>;
	public daySource: DataSource<number>;

	private cancelationToken: CancellationToken;

	constructor(config: ClockConfig) {
		let { speed = 0, autoStart = false, timestamp = 0 } = config;
		super(timestamp);
		this.speed = speed;

		this.daySource = new DataSource();
		this.hourSource = new DataSource();
		this.minuteSource = new DataSource();
		this.secondSource = new DataSource();

		if (autoStart) {
			this.start();
		}
	}

	public getCurrentTimeAsMoment(): Moment {
		return new Moment(this.timestamp);
	}

	public start(): void {
		if (this.cancelationToken === undefined || this.cancelationToken.isCanceled) {
			this.cancelationToken = new CancellationToken();
			let lastTs = Date.now();
			onBeforeRender.subscribe(() => {
				const delta = Date.now() - lastTs;
				lastTs += delta;
				this.update(delta);
			}, this.cancelationToken);
		} else {
			throw new Error('clock started twice without stopping');
		}
	}

	public stop(): void {
		if (this.cancelationToken === undefined) {
			throw new Error('stopped clock before starting it');
		} else {
			this.cancelationToken.cancel();
		}
	}

	public update(delta: number): void {
		const second = Math.floor(this._timestamp / 1000);
		const minute = Math.floor(this._timestamp / 60000);
		const hour = Math.floor(this._timestamp / 3600000);
		const day = Math.floor(this._timestamp / (3600000 * 24));

		this._timestamp += delta * this.speed;

		const newSecond = Math.floor(this._timestamp / 1000);
		const newMinute = Math.floor(this._timestamp / 60000);
		const newHour = Math.floor(this._timestamp / 3600000);
		const newDay = Math.floor(this._timestamp / (3600000 * 24));

		if (newSecond != second) {
			this.secondSource.update(this.secondOfTheMinute);
		}

		if (newMinute != minute) {
			this.minuteSource.update(this.minuteOfTheHour);
		}

		if (newHour != hour) {
			this.hourSource.update(this.hourOfTheDay);
		}

		if (newDay !== day) {
			this.daySource.update(this.days);
		}
	}
}
