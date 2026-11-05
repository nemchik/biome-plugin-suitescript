/**
 * What happens when a module parameter reuses the name of the other global
 * (`N/log` bound to `util`, `N/util` bound to `log`)? The upgrade skill says
 * renaming `log` or `util` "can break logging or utility calls".
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-001
 * @rule noGlobalShadowing
 */
define(["N/log", "N/util"], (util, log) => ({
  run() {
    const result = {};
    const t = (key, fn) => {
      try {
        result[key] = fn();
      } catch (e) {
        result[key] = `THROWS: ${e.name}: ${e.message}`;
      }
    };
    t("util (bound to N/log): typeof debug", () => typeof util.debug);
    t("util (bound to N/log): typeof isArray", () => typeof util.isArray);
    t("log (bound to N/util): typeof isArray", () => typeof log.isArray);
    t("log (bound to N/util): typeof debug", () => typeof log.debug);
    t("log.isArray([]) on the shadowing binding", () => log.isArray([]));
    t("util.debug call on the shadowing binding", () => {
      util.debug("probe", "N/log bound to util");
      return "ok";
    });
    return result;
  },
}));
