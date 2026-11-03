define(['N/search', 'N/record', 'N/task', 'N/render'], (search, record, task, render) => {
	const columns = [search.createColumn({ name: 'internalid' }), search.createFilter({ name: 'a' })];
	const loaded = record.load({ type: 'x', id: 1 });
	const onRequest = () => {
		task.create({ taskType: task.TaskType.MAP_REDUCE, scriptId: 's', deploymentId: 'd', params: {} });
		render.pickingTicket({ entityId: 1, inCustLocale: true });
		return { columns, loaded };
	};
	return { onRequest };
});
