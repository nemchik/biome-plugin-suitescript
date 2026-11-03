import * as record from 'N/record';

export const onRequest = () => {
	record.load({ type: 'customer' });
	record.nope();
};
