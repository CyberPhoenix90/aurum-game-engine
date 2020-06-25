import { clamp } from '../../math/math_utils';
import { CancellationToken } from 'aurumjs';

export interface AnimateOptions {
	duration: number;
	cancellationToken?: CancellationToken;
}

export function animate(cb: (progress: number) => void, options: AnimateOptions): Promise<void> {
	const startTime: number = performance.now();
	return new Promise<void>((resolve) => {
		requestAnimationFrame(function f() {
			if (!options.cancellationToken || !options.cancellationToken.isCanceled) {
				const timeSinceStart: number = performance.now() - startTime;
				const progress: number = timeSinceStart / options.duration;
				cb(clamp(progress, 0, 1));

				if (progress >= 1) {
					resolve();
				} else {
					requestAnimationFrame(f);
				}
			}
		});
	});
}
