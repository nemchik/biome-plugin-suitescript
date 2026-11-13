# Can a RESTlet read `scriptnote`, the execution log?

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-13
- **Method:** deployed RESTlet (the suitescript-verify runner)
- **Script type:** RESTlet
- **Probe:** [verification/probes/script-note-read.js](../../../verification/probes/script-note-read.js)
- **Contradictions settled:** C-017
- **Issue:** [#130](https://github.com/nemchik/biome-plugin-suitescript/issues/130)

## Test

```js
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
        const suiteql = (sql) =>
            query.runSuiteQL({ query: sql }).asMappedResults();

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
```

## Results

```json
{
    "query.Type.SCRIPT_NOTE": "scriptnote",
    "search.Type has a script note member": [
        "NOTE",
        "NOTE_TYPE",
        "GL_LINES_AUDIT_LOG",
        "SYSTEM_NOTE"
    ],
    "suiteql count": {
        "n": 137484
    },
    "suiteql first row, column kinds": {
        "date": "string",
        "type": "string",
        "title": "string",
        "detail": "string",
        "scripttype": "number"
    },
    "suiteql types": [
        {
            "t": "SYSTEM",
            "n": 124
        },
        {
            "t": "DEBUG",
            "n": 94242
        },
        {
            "t": "AUDIT",
            "n": 42944
        },
        {
            "t": "ERROR",
            "n": 174
        }
    ],
    "suiteql the guide's ERROR filter": {
        "n": 29
    },
    "suiteql scriptnotetype lookup": [
        {
            "id": "EMERGENCY",
            "name": "Emergency"
        },
        {
            "id": "ERROR",
            "name": "Error"
        },
        {
            "id": "SYSTEM",
            "name": "System"
        },
        {
            "id": "DEBUG",
            "name": "Debug"
        },
        {
            "id": "INTERNAL",
            "name": "Internal"
        },
        {
            "id": "AUDIT",
            "name": "Audit"
        }
    ],
    "query.create columns": "no rows",
    "search.create type scriptnote": "THROWS: INVALID_RCRD_TYPE: The record type [SCRIPTNOTE] is invalid."
}
```

## Explanation

- **SuiteQL reads `scriptnote`.** The table holds tens of thousands of rows in this sandbox, and each row has `date`, `type`, `title`, `detail` and a numeric `scripttype`. That confirms the SAFE guide's claim. The guide writes the last column `scriptType`; SuiteQL returned it as `scripttype`, which is only a case difference.
- **The types are the log levels.** The distinct `type` values were `DEBUG`, `AUDIT`, `ERROR` and `SYSTEM`, and the `scriptnotetype` lookup lists those plus `EMERGENCY` and `INTERNAL`. The guide's `type = 'ERROR'` filter ran and returned a count.
- **`query.Type.SCRIPT_NOTE` exists** and its value is `scriptnote`, as the type definitions say.
- **`search.create` does not work.** `search.create({ type: "scriptnote" })` throws `INVALID_RCRD_TYPE`, and `search.Type` has no member for it (the note-like members it does have are other records). Oracle's "Server Script Log search" is therefore not a `search.create` type.
- **`query.create` found no rows.** The probe's result was "no rows" for the column check on the query-module path, which does not show whether the query-module path is unusable, because the probe did not say why. Do not rely on this result.
- **Oracle documents no `scriptnote` table.** Its silence is not a contradiction of the behavior above; it only means the SuiteQL table is undocumented.
- **The role could read the log.** A RESTlet running as the runner's role read the rows with no permission error. This page does not say which permission allowed that, and a role without one may be refused.

## Decision

No rule depends on this. C-017 is marked verified for SuiteQL and `search.create` only: a RESTlet can read `scriptnote` with SuiteQL and `search.create` cannot. The `query.create` result ("no rows") is ambiguous, and which permission allowed the read is unknown, so neither is settled. The table is undocumented by Oracle, so a rule or recommendation built on it should say the source is the SAFE guide and observed behavior. No log text was recorded. The probe returns counts, types and column kinds only.

There is no `script-note-read.expect.json`: the row counts change on every run, and the drift check compares the whole output, so any expected file would report false drift.
