define(['N/file', 'N/currentRecord'], (file, currentRecord) => {
	return { pageInit: () => currentRecord.get() };
});
