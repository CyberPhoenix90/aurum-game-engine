import { Unit } from './unit';

export enum Operators {
	PLUS,
	MINUS
}

export class Calculation {
	public operands: Array<Unit | 'inherit' | 'remainder' | 'content'>;
	public operators: Operators[];

	constructor(value: string) {
		this.operands = [];
		this.operators = [];
		this.parse(value);
	}

	private parse(value: string) {
		let left = value.trim();
		if (left.startsWith('calc(')) {
			left = left.substring(5, left.length - 1).trim();
			while (left.length > 0) {
				let op = '';
				let i = 0;
				while (!['+', '-'].includes(left[i]) && i !== left.length) {
					op += left[i];
					i++;
				}

				if (left[i] === '+') {
					this.operators.push(Operators.PLUS);
				} else if (left[i] === '-') {
					this.operators.push(Operators.MINUS);
				}

				op = op.trim();
				if (op === 'inherit' || op === 'remainder' || op === 'content') {
					this.operands.push(op);
				} else {
					this.operands.push(new Unit(op));
				}
				left = left.substring(i + 1);
			}
		} else {
			throw new Error(`Invalid calc expression ${value}`);
		}
	}

	public toPixels(dpi: number, parentSize: number, distanceToEdge: number, computeContentSize?: () => number): number {
		return this.operands
			.map((p) => {
				switch (p) {
					case 'content':
						if (computeContentSize) {
							return computeContentSize();
						} else {
							throw new Error('content in calculation is not supported in this context');
						}
					case 'inherit':
						return parentSize;
					case 'remainder':
						return distanceToEdge;
					default:
						return p.toPixels(dpi, parentSize);
				}
			})
			.reduce((p, c, i) => {
				if (this.operators[i] === Operators.PLUS) {
					return p + c;
				} else {
					return p - c;
				}
			});
	}
}
