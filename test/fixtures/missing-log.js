define(['N/record'], (record) => {
	log.debug('t', 'd');
	return { execute: () => record.load({ type: 'x', id: 1 }) };
});
