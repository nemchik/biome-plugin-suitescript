/**
 * Can a RESTlet read `scriptnote`, the execution log? The SAFE guide says
 * SuiteQL reads it; the type definitions list `query.Type.SCRIPT_NOTE`; Oracle
 * documents only the Script Execution Logs page and a Server Script Log search.
 * Read-only, and it reports counts, the type values and the kind of each
 * column, never a title or detail, so no log text reaches the output.
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-017
 */
define(["N/query", "N/search"], (query, search) => ({
  run() {
    const result = {};
    const t = (key, fn) => {
      try {
        result[key] = fn();
      } catch (e) {
        result[key] = `THROWS: ${e.name}: ${e.message}`;
      }
    };
    const kinds = (row) => {
      const out = {};
      for (const [k, v] of Object.entries(row)) {
        out[k] = v === null ? "null" : typeof v;
      }
      return out;
    };
    const suiteql = (sql) => query.runSuiteQL({ query: sql }).asMappedResults();

    t("query.Type.SCRIPT_NOTE", () => query.Type.SCRIPT_NOTE);
    t("search.Type has a script note member", () =>
      Object.keys(search.Type).filter((k) => /NOTE|LOG/.test(k)),
    );
    t(
      "suiteql count",
      () => suiteql("SELECT COUNT(*) AS n FROM scriptnote")[0],
    );
    t("suiteql first row, column kinds", () => {
      const rows = suiteql(
        "SELECT sn.date, sn.type, sn.title, sn.detail, sn.scriptType FROM scriptnote sn FETCH FIRST 1 ROWS ONLY",
      );
      return rows.length ? kinds(rows[0]) : "no rows";
    });
    t("suiteql types", () =>
      suiteql(
        "SELECT sn.type AS t, COUNT(*) AS n FROM scriptnote sn GROUP BY sn.type",
      ),
    );
    t(
      "suiteql the guide's ERROR filter",
      () =>
        suiteql(
          "SELECT COUNT(*) AS n FROM scriptnote sn WHERE sn.type = 'ERROR' AND sn.date >= SYSDATE - 7",
        )[0],
    );
    t("suiteql scriptnotetype lookup", () =>
      suiteql("SELECT id, name FROM scriptnotetype"),
    );
    t("query.create columns", () => {
      const q = query.create({ type: query.Type.SCRIPT_NOTE });
      const page = q.run().asMappedResults().slice(0, 1);
      return page.length ? kinds(page[0]) : "no rows";
    });
    t("search.create type scriptnote", () => {
      const rows = search
        .create({ columns: ["internalid"], type: "scriptnote" })
        .run()
        .getRange({ end: 1, start: 0 });
      return `ok, ${rows.length} row(s)`;
    });
    return result;
  },
}));
