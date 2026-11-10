/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/util'], (util) => ({
	onRequest() {
		return util.isAsyncFunction(() => {});
	},
}));
