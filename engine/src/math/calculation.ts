import { Unit } from './unit';
import { DataSource } from 'aurumjs';
import { ReadonlyData } from '../models/input_data';
import { _ } from '../utilities/other/streamline';

export enum Operators {
	PLUS,
	MINUS
}

export function calculation(
	expression: ReadonlyData<string>,
	dpi: ReadonlyData<number>,
	parentSize: ReadonlyData<number>,
	distanceToEdge: ReadonlyData<number>
): DataSource<number> {
	const result = new DataSource<number>();
	const operands: DataSource<Array<Unit | 'inherit' | 'remainder'>> = new DataSource();
	const operators: DataSource<Operators[]> = new DataSource();

	_.toSource(expression).listenAndRepeat((value) => {
		parse(value);
	});

	operators.aggregateFour(
		_.toSource(dpi),
		_.toSource(parentSize),
		_.toSource(distanceToEdge),
		(operators: Operators[], dpi: number, parentSize: number, distanceToEdge: number) => {
			result.update(toPixels(dpi, parentSize, distanceToEdge));
		}
	);

	return result;

	function parse(value: string) {
		const operandsTmp = [];
		const operatorsTmp = [];
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
					operatorsTmp.push(Operators.PLUS);
				} else if (left[i] === '-') {
					operatorsTmp.push(Operators.MINUS);
				}

				op = op.trim();
				if (op === 'inherit' || op === 'remainder') {
					operandsTmp.push(op);
				} else {
					operandsTmp.push(new Unit(op));
				}
				left = left.substring(i + 1);
			}
		} else {
			throw new Error(`Invalid calc expression ${value}`);
		}

		operands.update(operandsTmp);
		operators.update(operatorsTmp);
	}

	function toPixels(dpi: number, parentSize: number, distanceToEdge: number): number {
		return operands.value
			.map((p) => {
				switch (p) {
					case 'inherit':
						return parentSize;
					case 'remainder':
						return distanceToEdge;
					default:
						return p.toPixels(dpi, parentSize);
				}
			})
			.reduce((p, c, i) => {
				if (operators.value[i] === Operators.PLUS) {
					return p + c;
				} else {
					return p - c;
				}
			});
	}
}
