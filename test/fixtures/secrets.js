define(['N/https'], (https) => {
	const password = 'hunter2';
	const passwordId = 'custsecret_x';
	const empty = { token_secret: '' };
	const config = { apiKey: 'abc123', name: 'service' };
	config.clientSecret = 'xyz';
	const fromParam = { secret: getSecret() };
	return { execute: () => [password, passwordId, empty, config, fromParam, https] };
});
