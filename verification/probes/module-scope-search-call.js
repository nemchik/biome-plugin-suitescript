/**
 * Does running a search at module scope (while `define()` runs) fail? The SAFE
 * guide says N/ APIs are unavailable during the define() callback and that
 * calling them "causes deployment failure". A combined probe that also loaded
 * and created records stopped the runner loading; this one isolates the
 * search. A failure that try/catch cannot capture makes every probe return
 * HTTP 400, which is itself the evidence.
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-011
 * @rule noModuleScopeApiCalls
 */
define(["N/search"], (search) => {
  const early = {};
  try {
    const rows = search
      .create({ columns: ["entityid"], type: "customer" })
      .run()
      .getRange({ end: 1, start: 0 });
    early["search.create().run().getRange() at module scope"] =
      `rows: ${rows.length}`;
  } catch (e) {
    early["search.create().run().getRange() at module scope"] =
      `THROWS: ${e.name}: ${e.message}`;
  }
  return {
    run() {
      return early;
    },
  };
});
