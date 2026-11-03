define(['N/record'], (record) => {
  const id = 'N/search';
  require(['N/search'], () => {});
  require(['N/' + id], () => {});
  require(id, () => {});
  require('N/email');
  return { record };
});
define(() => {});
