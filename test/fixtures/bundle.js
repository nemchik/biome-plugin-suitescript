define(['N/record', './helper'], (record, helper) => {
	const beforeInstall = () => [record, helper];
	return { beforeInstall };
});
