/**
 * Can a RESTlet reach a Suitelet with `https.requestSuitelet`? A real call
 * needs a deployed Suitelet, so this reports what the call does without one:
 * whether the method exists and which error each bad input throws. Oracle
 * validates `scriptId`, `deploymentId` and `urlParams`; the SAFE guide uses a
 * `params` option; the type definitions say only `external: true` works.
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-016
 */
define(["N/https"], (https) => ({
  run() {
    const result = {};
    const t = (key, fn) => {
      try {
        const r = fn();
        result[key] = `returned ${typeof r}`;
      } catch (e) {
        result[key] = `THROWS: ${e.name}: ${e.message}`;
      }
    };
    result.typeofRequestSuitelet = typeof https.requestSuitelet;
    result.typeofPromise = typeof https.requestSuitelet?.promise;
    t("no options", () => https.requestSuitelet({}));
    t("scriptId only", () =>
      https.requestSuitelet({ scriptId: "customscript_nonexistent" }),
    );
    t("deploymentId only", () =>
      https.requestSuitelet({ deploymentId: "customdeploy_nonexistent" }),
    );
    t("nonexistent script and deployment", () =>
      https.requestSuitelet({
        deploymentId: "customdeploy_nonexistent",
        scriptId: "customscript_nonexistent",
      }),
    );
    t("nonexistent, SAFE guide params option", () =>
      https.requestSuitelet({
        deploymentId: "customdeploy_nonexistent",
        params: { action: "getData" },
        scriptId: "customscript_nonexistent",
      }),
    );
    t("nonexistent, urlParams as a string", () =>
      https.requestSuitelet({
        deploymentId: "customdeploy_nonexistent",
        scriptId: "customscript_nonexistent",
        urlParams: "a=b",
      }),
    );
    t("nonexistent, external true", () =>
      https.requestSuitelet({
        deploymentId: "customdeploy_nonexistent",
        external: true,
        scriptId: "customscript_nonexistent",
      }),
    );
    t("nonexistent, Authorization header", () =>
      https.requestSuitelet({
        deploymentId: "customdeploy_nonexistent",
        headers: { Authorization: "Bearer x" },
        scriptId: "customscript_nonexistent",
      }),
    );
    // The runner is a RESTlet, so Oracle's SSS_INVALID_SCRIPT_ID_1 ("does not
    // reference a Suitelet script") should fire if the script lookup runs.
    t("a RESTlet script id", () =>
      https.requestSuitelet({
        deploymentId: "customdeploy_suitescript_verify_runner",
        scriptId: "customscript_suitescript_verify_runner",
      }),
    );
    return result;
  },
}));
