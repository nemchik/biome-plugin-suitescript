define([], () => {
	const onRequest = (context) => {
		window.nlapiLoadRecord('x', 1);
		rec.getLineItemValue('item', 'id', 1);
		rec.getFieldValue('name');
		rec.setFieldValue('name', 'x');
		record.getValue({ fieldId: 'name' });
		try {
			run();
		} catch (e) {
			e.getCode();
			other.getCode();
		}
	};
	return { onRequest };
});
