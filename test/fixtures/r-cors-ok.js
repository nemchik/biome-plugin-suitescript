define(['N/email'], (email) => {
	const onRequest = () => {
		email.send({});
	};
	return { onRequest };
});
