define(['N/record'], (record) => {
	return { onRequest: () => record };
});
define(['N/search'], (search) => search);
