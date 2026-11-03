define(['N/record', 'N/search', 'N/query', 'N/email'], (record, search, query, email) => {
	const onRequest = (context) => {
		const columns = [search.createColumn({ name: 'internalid' }), search.createColumn('item')];
		const q = query.create({ type: 'customer' });
		q.createColumn({ fieldId: 'id' });
		const inner = (record) => record.setSublistValue({ sublistId: 'item' });
		const email2 = (email) => email.includes('@');
		const toString = 1;
		const valueOf = () => 1;
		const err = new Error('x');
		err.toString();
		return { columns, inner, email2, toString, valueOf };
	};
	return { onRequest };
});
