define('named', ['N/log', 'N/bogus', './lib.js', 'N/record', 'N/search'], (log, bogus, lib, rec) => {
	log.debug('only details');
	log.error({ details: 'x' });
	log.audit({ title: 't' });
	const o = {};
	return o;
});
