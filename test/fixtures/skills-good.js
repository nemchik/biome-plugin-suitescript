define(['N/log', 'N/record', 'N/query'], (log, record, query) => {
	let cached = null;
	const run = (id) => {
		cached = cached ?? record.create({ type: 'x' });
		try {
			return query.runSuiteQL({
				query: 'SELECT id FROM t ' + 'WHERE id = ?',
				params: [id],
			});
		} catch (error) {
			log.error({ title: 'run', details: error.message });
		}
		util.each([], () => {});
	};
	return { execute: run };
});
