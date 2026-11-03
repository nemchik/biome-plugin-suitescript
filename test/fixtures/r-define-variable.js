var dependencies = ['N/record', 'N/search'];

define(dependencies, function (record, search) {
	var onRequest = function () {
		record.load({ type: 'customer' });
		search.createColumn({ name: 'x' });
	};
	return { onRequest: onRequest };
});
