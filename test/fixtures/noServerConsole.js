define(['N/record'], (record) => {
	const onRequest = (context) => {
		console.log('a');
		console.debug('b');
		console.info('c');
		console.warn('d');
		console.error('e');
		console.table([record]);
		log.debug('ok', context);
	};
	return { onRequest };
});
