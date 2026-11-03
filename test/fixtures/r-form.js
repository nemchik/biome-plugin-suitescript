define(['N/ui/serverWidget'], (serverWidget) => {
	const beforeLoad = (context) => {
		context.form.addField({ id: 'name', label: 'Name', type: 'text' });
		context.form.addField({ id: 'custpage_ok', label: 'Ok', type: 'text' });
		context.form.addFieldGroup({ id: 'group', label: 'Group' });
		const form = serverWidget.createForm({ title: 'T' });
		form.addField({ id: 'name', label: 'Name', type: 'text' });
	};
	return { beforeLoad };
});
