/**
 * Does calling `runtime` or `search.createColumn` at module scope (while
 * `define()` runs) fail? The SAFE guide says "All N/ API modules are
 * unavailable during the define() callback execution". Each call is captured as
 * data. This is the first, lowest-risk step of splitting a probe that stopped
 * the runner from loading: a failure that try/catch cannot capture makes every
 * probe return HTTP 400, which is itself the evidence.
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-011
 * @rule noModuleScopeApiCalls
 */
define(["N/runtime", "N/search"], (runtime, search) => {
  const early = {};
  const t = (key, fn) => {
    try {
      early[key] = fn();
    } catch (e) {
      early[key] = `THROWS: ${e.name}: ${e.message}`;
    }
  };
  t(
    "runtime.getCurrentScript() at module scope",
    () => typeof runtime.getCurrentScript(),
  );
  t("runtime.envType at module scope", () => String(runtime.envType));
  t(
    "search.createColumn() at module scope",
    () => typeof search.createColumn({ name: "entityid" }),
  );
  return {
    run() {
      return early;
    },
  };
});
