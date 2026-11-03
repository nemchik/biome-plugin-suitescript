define(['N/record'], (record) => {
	const afterSubmit = (context) => {
		const log = 1;
		return record.load({ type: 'x', id: 1 });
	};
	return { afterSubmit };
});
