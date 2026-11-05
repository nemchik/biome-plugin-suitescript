/**
 * Does a SuiteQL abbreviation as the `type` of `search.create` throw? Only the
 * SAFE guide says so ("The record type [PURCHORD] is invalid.").
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-012
 * @rule noSuiteQLTypeInSearch
 */
define(["N/search"], (search) => ({
  run() {
    const result = {};
    const t = (key, fn) => {
      try {
        result[key] = fn();
      } catch (e) {
        result[key] = `THROWS: ${e.name}: ${e.message}`;
      }
    };
    for (const type of [
      "PURCHORD",
      "PurchOrd",
      "purchaseorder",
      search.Type.PURCHASE_ORDER,
      "Estimate",
      "estimate",
      "CashSale",
      "cashsale",
      "SalesOrd",
      "salesorder",
      "CustInvc",
      "invoice",
      "VendBill",
      "vendorbill",
      "Journal",
      "journalentry",
      "ExpRept",
      "expensereport",
      "InvAdjst",
      "inventoryadjustment",
    ]) {
      t(`type '${type}'`, () => {
        search
          .create({ columns: ["internalid"], type })
          .run()
          .getRange({ end: 1, start: 0 });
        return "ok";
      });
    }
    return result;
  },
}));
