/**
 * Are `log` and `util` globals in a deployed server script, and are they the
 * same objects as the `N/log` and `N/util` modules? The learning skill says
 * N/log is "not globally available"; the upgrade skill and Oracle's `util
 * Object` page say it is loaded by default.
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-001
 * @rule noGlobalShadowing
 */
define(["N/log", "N/util"], (logModule, utilModule) => ({
  run() {
    const result = {};
    const t = (key, fn) => {
      try {
        result[key] = fn();
      } catch (e) {
        result[key] = `THROWS: ${e.name}: ${e.message}`;
      }
    };
    t("typeof log (global)", () => typeof log);
    t("typeof util (global)", () => typeof util);
    t("log.debug works as a global", () => {
      log.debug("probe", "global log works");
      return "ok";
    });
    t("N/log module is the global log", () => logModule === log);
    t("N/util module is the global util", () => utilModule === util);
    t("util.isArray works as a global", () => util.isArray([]));
    return result;
  },
}));
