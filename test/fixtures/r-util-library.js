// Not a SuiteScript module: shared code that may run outside NetSuite, where `util` does not exist.
export function check(value, a, b) {
	Array.isArray(value);
	typeof value === 'string';
	Object.assign(a, b);
	[1].forEach((n) => n);
	util.isArray(value);
}
