# A SuiteQL abbreviation as the type of `search.create`

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-05
- **Method:** deployed RESTlet (the verification runner)
- **Script type:** RESTlet
- **Probe:** [verification/probes/suiteql-type-in-search.js](../../../verification/probes/suiteql-type-in-search.js)
- **Contradictions settled:** C-012
- **Issue:** [#69](https://github.com/nemchik/biome-plugin-suitescript/issues/69)

## Test

```js
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
                    .create({ type, columns: ["internalid"] })
                    .run()
                    .getRange({ start: 0, end: 1 });
                return "ok";
            });
        }
        return result;
    },
}));
```

## Results

```json
{
    "type 'PURCHORD'": "THROWS: INVALID_RCRD_TYPE: The record type [PURCHORD] is invalid.",
    "type 'PurchOrd'": "THROWS: INVALID_RCRD_TYPE: The record type [PURCHORD] is invalid.",
    "type 'purchaseorder'": "THROWS: INSUFFICIENT_PERMISSION: Permission Violation: You need  the 'Transactions -> Find Transaction' permission to access this page. Please contact your account administrator.",
    "type 'Estimate'": "THROWS: INSUFFICIENT_PERMISSION: Permission Violation: You need  the 'Transactions -> Find Transaction' permission to access this page. Please contact your account administrator.",
    "type 'estimate'": "THROWS: INSUFFICIENT_PERMISSION: Permission Violation: You need  the 'Transactions -> Find Transaction' permission to access this page. Please contact your account administrator.",
    "type 'CashSale'": "THROWS: INSUFFICIENT_PERMISSION: Permission Violation: You need  the 'Transactions -> Find Transaction' permission to access this page. Please contact your account administrator.",
    "type 'cashsale'": "THROWS: INSUFFICIENT_PERMISSION: Permission Violation: You need  the 'Transactions -> Find Transaction' permission to access this page. Please contact your account administrator.",
    "type 'SalesOrd'": "THROWS: INVALID_RCRD_TYPE: The record type [SALESORD] is invalid.",
    "type 'salesorder'": "THROWS: INSUFFICIENT_PERMISSION: Permission Violation: You need  the 'Transactions -> Find Transaction' permission to access this page. Please contact your account administrator.",
    "type 'CustInvc'": "THROWS: INVALID_RCRD_TYPE: The record type [CUSTINVC] is invalid.",
    "type 'invoice'": "THROWS: INSUFFICIENT_PERMISSION: Permission Violation: You need  the 'Transactions -> Find Transaction' permission to access this page. Please contact your account administrator.",
    "type 'VendBill'": "THROWS: INVALID_RCRD_TYPE: The record type [VENDBILL] is invalid.",
    "type 'vendorbill'": "THROWS: INSUFFICIENT_PERMISSION: Permission Violation: You need  the 'Transactions -> Find Transaction' permission to access this page. Please contact your account administrator.",
    "type 'Journal'": "THROWS: INVALID_RCRD_TYPE: The record type [JOURNAL] is invalid.",
    "type 'journalentry'": "THROWS: INSUFFICIENT_PERMISSION: Permission Violation: You need  the 'Transactions -> Find Transaction' permission to access this page. Please contact your account administrator.",
    "type 'ExpRept'": "THROWS: INVALID_RCRD_TYPE: The record type [EXPREPT] is invalid.",
    "type 'expensereport'": "THROWS: INSUFFICIENT_PERMISSION: Permission Violation: You need  the 'Transactions -> Find Transaction' permission to access this page. Please contact your account administrator.",
    "type 'InvAdjst'": "THROWS: INVALID_RCRD_TYPE: The record type [INVADJST] is invalid.",
    "type 'inventoryadjustment'": "THROWS: INSUFFICIENT_PERMISSION: Permission Violation: You need  the 'Transactions -> Find Transaction' permission to access this page. Please contact your account administrator."
}
```

## Explanation

Confirmed. Every abbreviation tried (`PURCHORD`, `PurchOrd`, `SalesOrd`, `CustInvc`, `VendBill`, `Journal`, `ExpRept`, `InvAdjst`) throws `INVALID_RCRD_TYPE: The record type [...] is invalid.` (the error upper-cases the name, as the SAFE guide's example shows). The lowercase search types, and `Estimate` and `CashSale`, pass the type check and stop at a permission error because the sandbox role lacks Transactions > Find Transaction. That error comes after the type is accepted, so those spellings are valid types. The rule leaving out `Estimate` and `CashSale` is correct.

## Decision

The failure claim holds, so `noSuiteQLTypeInSearch` keeps `error`. Its source comment now cites this page and drops the unchecked note. C-012 is verified.
