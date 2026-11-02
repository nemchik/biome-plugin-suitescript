define(['N/currentRecord', 'N/ui/dialog', 'N/record'], (currentRecord, dialog, record) => {
	const window = {};
	const run = () => {
		document.title = 'x';
		return [currentRecord, dialog, record, window];
	};
	return { execute: run };
});
