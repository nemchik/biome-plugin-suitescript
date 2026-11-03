import type { AnyJsAstNode, JsCallExpression } from "@biomejs/runtime/plugin";
import { optionsObject, propertyValue } from "./options.ts";
import { isStaticString } from "./suitescript.ts";

/** Matches query.runSuiteQL, runSuiteQLPaged and their .promise forms. */
export const SUITEQL = /(^|\.)runSuiteQL(Paged)?(\.promise)?$/;

/** The query argument of a runSuiteQL call, from an options object or a bare argument. */
export function suiteqlQuery(call: JsCallExpression): AnyJsAstNode | undefined {
  const options = optionsObject(call);
  return options
    ? propertyValue(options, "query")
    : call.arguments?.children()[0]?.children()[0];
}

/** The SQL of a runSuiteQL call when it is built only from literals. */
export function staticSuiteql(call: JsCallExpression): string | undefined {
  const sql = suiteqlQuery(call);
  return sql && isStaticString(sql) ? sql.text : undefined;
}
