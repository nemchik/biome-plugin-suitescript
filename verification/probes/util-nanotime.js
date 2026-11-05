/**
 * Does `util.nanoTime` work in a deployed server script? The type definitions
 * declare it, Oracle has no help page for it, and the script debugger throws.
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-010
 */
define([], () => ({
  run() {
    const result = {};
    const t = (key, fn) => {
      try {
        result[key] = fn();
      } catch (e) {
        result[key] = `THROWS: ${e.name}: ${e.message}`;
      }
    };
    t("typeof util.nanoTime", () => typeof util.nanoTime);
    t("nanoTime() typeof", () => typeof util.nanoTime());
    t("nanoTime() is non-decreasing", () => {
      const a = util.nanoTime();
      const b = util.nanoTime();
      return b >= a;
    });
    return result;
  },
}));
