define(['N/record'], (record) => {
	function beforeSubmit(context) {
		record.load({ type: context.newRecord.type, id: context.newRecord.id });
		record.load({ type: 'x', id: 5 });
	}
	return { beforeSubmit, afterSubmit: (context) => {} };
});
