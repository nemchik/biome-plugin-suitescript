define([], () => {
	const trace = () => {
		console.log('a library may be shared with client scripts');
	};
	return { trace };
});
