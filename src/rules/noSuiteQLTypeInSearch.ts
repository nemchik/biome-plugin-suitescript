import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { optionsObject, propertyValue, stringValue } from "../lib/options.ts";

// SuiteQL abbreviations that are not search types. `Estimate` and `CashSale` are
// left out: their lowercase form is a valid search type.
const ABBREVIATIONS = new Set([
  "PurchOrd",
  "SalesOrd",
  "CustInvc",
  "ItemRcpt",
  "ItemShip",
  "VendBill",
  "VendPymt",
  "CustPymt",
  "Journal",
  "CustCred",
  "RtnAuth",
  "TrnfrOrd",
  "WorkOrd",
  "ExpRept",
  "InvAdjst",
  "VendCred",
]);

// Oracle's SAFE guide: "Passing a SuiteQL abbreviation to `search.create()` throws
// a runtime error: `The record type [PURCHORD] is invalid.` Always use
// `search.Type.*` enum values (or their lowercase string equivalents) in N/search,
// and SuiteQL abbreviations only inside SuiteQL query strings." The failure claim
// comes only from this skill, and a deployed RESTlet confirms it (2026.2):
// docs/verification/results/suiteql-type-in-search.md, C-012.
export const noSuiteQLTypeInSearch = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!/^search\.create(\.promise)?$/.test(node.callee?.text ?? "")) return;
    const options = optionsObject(node);
    const type = options && propertyValue(options, "type");
    const value = stringValue(type);
    if (type && value && ABBREVIATIONS.has(value)) {
      registerDiagnostic(
        type,
        "error",
        `'${value}' is a SuiteQL abbreviation, not a search type; use search.Type.`,
      );
    }
  },
});
