define([], () => {
	const handlers = {
		*each() {},
		fine() {},
	};
	const onRequest = () => {
		for (const x of []) {}
	};
	return { onRequest };
});
