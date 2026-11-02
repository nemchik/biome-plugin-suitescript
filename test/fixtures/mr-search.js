define(['N/search'], (search) => {
	const getInputData = () => {
		const rows = search.create({ type: 'x' }).run().getRange({ start: 0, end: 10 });
		return rows;
	};
	const direct = () => search.create({ type: 'x' }).run().getRange({ start: 0, end: 1 });
	const map = () => {};
	return { getInputData, map };
});
