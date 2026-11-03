define(['N/record', 'N/search'], function (record, search) {
	var count = 0;
	eval('count = 1');
	setTimeout('work()', 10);
	const onRequest = () => count;
	return { onRequest };
});
