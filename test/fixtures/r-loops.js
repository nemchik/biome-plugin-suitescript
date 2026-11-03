define(['N/record', 'N/query', 'N/search'], (record, query, search) => {
	const execute = () => {
		for (const id of ids) {
			record.load({ type: 'x', id });
			record.create({ type: 'x' });
			query.runSuiteQL({ query: 'SELECT 1', params: [] });
			search.create({ type: 'customer' });
		}
		ids.forEach((id) => record.submitFields({ type: 'x', id, values: {} }));
		record.load({ type: 'x', id: 1 });
	};
	return { execute };
});
