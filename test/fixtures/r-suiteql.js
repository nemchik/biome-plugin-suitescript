define(['N/query'], (query) => {
	const onRequest = () => {
		query.runSuiteQL({ query: `SELECT id FROM customer WHERE id IN (${placeholders})`, params: ids });
		query.runSuiteQL({ query: `SELECT id FROM customer WHERE id = ${id}` });
		query.runSuiteQL({ query: 'SELECT id FROM customer WHERE id = ' + id });
	};
	return { onRequest };
});
