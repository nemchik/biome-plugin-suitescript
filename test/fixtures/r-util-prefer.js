define(['N/util'], (util) => {
	const onRequest = (context, value, a, b, o) => {
		// preferUtilTypeChecks: flagged (12)
		Array.isArray(value);
		value instanceof Array;
		value.constructor === Array;
		Object.prototype.toString.call(value) === '[object Array]';
		typeof value === 'string';
		typeof value !== 'number';
		'boolean' === typeof value;
		typeof value == 'function';
		value instanceof Date;
		Object.prototype.toString.call(value) === '[object RegExp]';
		value.constructor.name === 'AsyncFunction';
		value instanceof AsyncFunction;

		// preferUtilTypeChecks: not flagged
		util.isArray(value);
		typeof value === 'object';
		typeof value === 'undefined';
		value instanceof Error;
		value instanceof Map;
		Object.prototype.toString.call(value) === '[object Object]';
		Object.prototype.toString.call(value) === '[object Function]';
		Array.isArray(value, 1);
		value.constructor === Date;

		// preferUtilExtend: flagged (2)
		Object.assign(a, b);
		Object.assign({}, o);

		// preferUtilExtend: not flagged
		util.extend(a, b);
		Object.assign(a, b, o);
		Object.assign(a, ...b);
		Object.assign({ a: 1 });
		({ ...a, ...b });

		// preferUtilEach: flagged (4)
		[1, 2].forEach((n) => n);
		Object.keys(o).forEach((k) => k);
		Object.values(o).forEach((v) => v);
		Object.entries(o).forEach(([k, v]) => k + v);

		// preferUtilEach: not flagged
		a.forEach((n) => n);
		new Set(a).forEach((n) => n);
		Object.keys(o).map((k) => k);
		[1, 2].forEach((n) => n, a);
		util.each([1, 2], (n) => n);
		for (const n of a) n;
	};
	return { onRequest };
});
