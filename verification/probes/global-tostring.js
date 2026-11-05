/**
 * Oracle documents a global `toString()` method as the replacement for
 * `instanceof` on SuiteScript objects, and says `instanceof` is not supported
 * for them. What do both do in a deployed script?
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-015
 */
define(["N/search", "N/runtime"], (search, runtime) => ({
  run() {
    const result = {};
    const t = (key, fn) => {
      try {
        result[key] = fn();
      } catch (e) {
        result[key] = `THROWS: ${e.name}: ${e.message}`;
      }
    };
    const objects = {
      column: () => search.createColumn({ name: "entityid" }),
      script: () => runtime.getCurrentScript(),
      search: () => search.create({ columns: ["entityid"], type: "customer" }),
      user: () => runtime.getCurrentUser(),
    };
    t("typeof toString", () => typeof toString);
    for (const [name, make] of Object.entries(objects)) {
      t(`${name}: toString(obj)`, () => toString(make()));
      t(`${name}: obj.toString()`, () => make().toString());
      t(`${name}: Object.prototype.toString.call`, () =>
        Object.prototype.toString.call(make()),
      );
      t(`${name}: instanceof Object`, () => make() instanceof Object);
      t(`${name}: instanceof Array`, () => make() instanceof Array);
    }
    t("typeof search.Search", () => typeof search.Search);
    t(
      "search instanceof search.Search",
      () => objects.search() instanceof search.Search,
    );
    t("[] instanceof Array", () => [] instanceof Array);
    t("new Date() instanceof Date", () => new Date() instanceof Date);
    return result;
  },
}));
