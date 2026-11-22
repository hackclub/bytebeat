import { parse, type Node } from 'acorn';

type Statement = Node & { type: string; expression?: Node };

export function toFunctionBody(code: string): string {
	const ast = parse(code, {
		ecmaVersion: 'latest',
		sourceType: 'script',
		allowReturnOutsideFunction: true
	}) as unknown as { body: Statement[] };

	const last = ast.body.at(-1);
	if (!last) throw new Error('write some code first');
	if (last.type === 'ReturnStatement') return code;
	if (last.type !== 'ExpressionStatement' || !last.expression) {
		throw new Error('the last line has to be the sound, like t*(t>>5|t>>8)');
	}
	const expr = code.slice(last.expression.start, last.expression.end);
	return `${code.slice(0, last.start)};return (${expr});${code.slice(last.end)}`;
}
