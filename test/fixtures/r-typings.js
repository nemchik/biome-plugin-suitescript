define(['N/record', 'N/search', 'N/email', 'N/https'], (record, search, email, https) => {
	const onRequest = () => {
		record.load({ type: record.Type.CUSTOMER });
		record.load({ type: 'customer', id: 1 });
		record.load({ id: 1, type: 'customer', foo: 1 });
		record.load('customer', 1);
		record.Type.CUSTOMR;
		record.loadRecord({});
		email.send({ author: 1, recipients: [1], subject: 's' });
		https.get({ url: 'https://example.com' });
		https.get({});
		https.Method.FETCH;
		https.Method.GET;
		other.load({});
		record.load.promise({ type: 'customer' });
		return { record, search };
	};
	return { onRequest };
});
