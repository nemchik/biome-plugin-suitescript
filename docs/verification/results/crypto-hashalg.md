# `crypto.HashAlg` members and `createHash` with MD5 and SHA-1

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-05
- **Method:** deployed RESTlet (the verification runner)
- **Script type:** RESTlet
- **Probe:** [verification/probes/crypto-hashalg.js](../../../verification/probes/crypto-hashalg.js)
- **Contradictions settled:** C-008
- **Issue:** [#41](https://github.com/nemchik/biome-plugin-suitescript/issues/41)

## Test

```js
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
        t("Object.keys(crypto.HashAlg)", () =>
            Object.keys(crypto.HashAlg).sort(),
        );
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
```

## Results

```json
{
    "HashAlg.MD5": "MD5",
    "HashAlg.SHA1": "SHA1",
    "HashAlg.SHA256": "SHA256",
    "HashAlg.SHA512": "SHA512",
    "Object.keys(crypto.HashAlg)": ["MD5", "SHA1", "SHA256", "SHA512"],
    "createHash with HashAlg.MD5": "THROWS: HASHING_ALGORITHM_IS_NO_LONGER_VALID: MD5 hashing algorithm is no longer valid",
    "createHash with HashAlg.SHA1": "THROWS: HASHING_ALGORITHM_IS_NO_LONGER_VALID: SHA1 hashing algorithm is no longer valid",
    "createHash with HashAlg.SHA256": "string",
    "createHash with HashAlg.SHA512": "string",
    "createHash with the string 'MD5'": "THROWS: HASHING_ALGORITHM_IS_NO_LONGER_VALID: MD5 hashing algorithm is no longer valid",
    "createHash with the string 'SHA1'": "THROWS: HASHING_ALGORITHM_IS_NO_LONGER_VALID: SHA1 hashing algorithm is no longer valid",
    "createHash with the string 'SHA256'": "string",
    "typeof crypto.HashAlg": "object"
}
```

## Explanation

`crypto.HashAlg` has four members at runtime: `MD5`, `SHA1`, `SHA256` and `SHA512`. The OWASP skill is right that `MD5` and `SHA1` exist; Oracle's `crypto.HashAlg` page and the type definitions list only `SHA256` and `SHA512`, so both are incomplete. `createHash` accepts `SHA256` and `SHA512` and rejects `MD5` and `SHA1` (by enum member or by string) with `HASHING_ALGORITHM_IS_NO_LONGER_VALID: MD5 hashing algorithm is no longer valid`.

## Decision

`noWeakHash`'s premise holds: the members exist, so the rule can fire. The code it flags does not even run, so the message could say so. A reworded message and a stronger severity are follow-ups. The type definitions omit two members that exist; the right route is a pull request to that project, once confirmed against Oracle's documentation, which also omits them. C-008 is verified.
