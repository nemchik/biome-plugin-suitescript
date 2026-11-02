define(['N/record', 'N/query'], (record, query) => {
	const log = {};
	const loaded = record.load({ type: 'x', id: 1 });
	function* ids() {}
	const run = (id, ids) => {
		email.send({});
		log.debug('t', 'd');
		eval('1 + 1');
		setTimeout('work()', 10);
		query.runSuiteQL({ query: 'SELECT id FROM t WHERE id = ' + id });
		query.runSuiteQL(`SELECT id FROM t WHERE id = ${id}`);
		nlapiGetContext();
		for (const i of ids) record.load({ type: 'x', id: i });
		ids.forEach((i) => record.load({ type: 'x', id: i }));
		return loaded[Symbol.iterator];
	};
	return { execute: run };
});
