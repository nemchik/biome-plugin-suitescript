import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import {
  descendants,
  enclosingFunctionNames,
  isFunction,
} from "../lib/script-side.ts";

const RESULTS = /\.getRange\(/;

// Oracle: running a search in getInputData and returning its results risks a
// timeout; return the search.create()/search.load() object instead. Detects
// `.getRange()` results returned directly or through a local variable.
export const noMapReduceSearchResults = defineRule({
  query: ast("JS_RETURN_STATEMENT"),
  run(node) {
    if (!enclosingFunctionNames(node).includes("getInputData")) return;
    const argument = node.children()[0];
    if (!argument) return;
    let flagged = RESULTS.test(argument.text);
    if (!flagged && argument.kind === "JS_IDENTIFIER_EXPRESSION") {
      const fn = node.ancestors().find(isFunction);
      for (const d of fn ? descendants(fn) : []) {
        if (d.kind !== "JS_VARIABLE_DECLARATOR") continue;
        const id = d.children().find((c) => c.kind === "JS_IDENTIFIER_BINDING");
        const init = d
          .children()
          .find((c) => c.kind === "JS_INITIALIZER_CLAUSE");
        if (id?.text === argument.text && init && RESULTS.test(init.text))
          flagged = true;
      }
    }
    if (flagged) {
      registerDiagnostic(
        argument,
        "warning",
        "Return the search object from getInputData instead of its results.",
      );
    }
  },
});
