define(['N/https', 'N/query', 'N/ui/serverWidget'], (https, query, serverWidget) => {
	const onRequest = (context) => {
		const form = serverWidget.createForm({ title: 'x' });
		form.addField({ id: 'name', type: 'text', label: 'Name' });
		context.form.addField({ id: 'name', type: 'text', label: 'Name' });
		context.form.addField({ id: 'custpage_ok', type: 'text', label: 'Ok' });
		https.get({ url: 'http://example.com', headers: { X_Custom: '1', 'X-Fine': '2' } });
		https.get({ url: 'https://example.com' });
		query.createColumn({ fieldId: 'id', formula: 'x' });
		query.createColumn({ fieldId: 'id' });
		return form;
	};
	return { onRequest };
});
