define(['N/record'], (record) => {
	const afterSubmit = (context) => {
		context.newRecord.save();
		record.load({ type: 'x', id: 1 }).save();
	};
	return { afterSubmit };
});
