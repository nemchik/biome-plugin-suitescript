/**
 * Which `crypto.HashAlg` members exist? The OWASP skill uses `MD5` and `SHA1`;
 * the type definitions list only `SHA256` and `SHA512`.
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-008
 * @rule noWeakHash
 */
define(["N/crypto"], (crypto) => ({
  run() {
    const result = {};
    const t = (key, fn) => {
      try {
        result[key] = fn();
      } catch (e) {
        result[key] = `THROWS: ${e.name}: ${e.message}`;
      }
    };
    const digest = (algorithm) => () => {
      const hash = crypto.createHash({ algorithm });
      hash.update({ input: "probe", inputEncoding: "UTF_8" });
      return typeof hash.digest({ outputEncoding: "HEX" });
    };
    t("typeof crypto.HashAlg", () => typeof crypto.HashAlg);
    t("Object.keys(crypto.HashAlg)", () => Object.keys(crypto.HashAlg).sort());
    for (const name of ["MD5", "SHA1", "SHA256", "SHA512"]) {
      t(`HashAlg.${name}`, () => String(crypto.HashAlg[name]));
      t(`createHash with HashAlg.${name}`, digest(crypto.HashAlg[name]));
    }
    t("createHash with the string 'MD5'", digest("MD5"));
    t("createHash with the string 'SHA1'", digest("SHA1"));
    t("createHash with the string 'SHA256'", digest("SHA256"));
    return result;
  },
}));
