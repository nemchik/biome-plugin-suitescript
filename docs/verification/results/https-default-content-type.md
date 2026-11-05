# The default `Content-Type` of `https.post`

- **NetSuite version:** 2026.2
- **Account type:** sandbox
- **Date:** 2026-11-05
- **Method:** deployed RESTlet (the verification runner)
- **Script type:** RESTlet
- **Probe:** [verification/probes/https-default-content-type.js](../../../verification/probes/https-default-content-type.js)
- **Contradictions settled:** C-005
- **Issue:** [#71](https://github.com/nemchik/biome-plugin-suitescript/issues/71)

## Test

```js
/**
 * What `Content-Type` does `https.post` send by default? The `N/https` default
 * table contradicts the `https.post` page. Posts dummy data to a public echo
 * service and reads back the header it saw.
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-005
 */
define(["N/https"], (https) => ({
    run() {
        const result = {};
        const t = (key, fn) => {
            try {
                result[key] = fn();
            } catch (e) {
                result[key] = `THROWS: ${e.name}: ${e.message}`;
            }
        };
        const echo = (body, headers) => {
            const res = https.post({
                url: "https://httpbin.org/post",
                body,
                headers,
            });
            const seen = JSON.parse(res.body).headers;
            return seen["Content-Type"] || "(none)";
        };
        t("string body, no headers", () => echo("a=1"));
        t("object body, no headers", () => echo({ a: "1" }));
        t("JSON string body, no headers", () => echo(JSON.stringify({ a: 1 })));
        t("Uint8Array body, no headers", () =>
            echo(new Uint8Array([97, 61, 49])),
        );
        return result;
    },
}));
```

## Results

```json
{
    "JSON string body, no headers": "text/xml; charset=UTF-8",
    "Uint8Array body, no headers": "application/octet-stream",
    "object body, no headers": "application/x-www-form-urlencoded; charset=UTF-8",
    "string body, no headers": "text/xml; charset=UTF-8"
}
```

## Explanation

With no `Content-Type` header, a string body (including a JSON string) is sent as `text/xml; charset=UTF-8`, an object body as `application/x-www-form-urlencoded; charset=UTF-8`, and a `Uint8Array` body as `application/octet-stream`. The `https.post` page agrees (objects are only for `application/x-www-form-urlencoded`; a `Uint8Array` defaults to `application/octet-stream`). Oracle's `N/https` default table has the `Object` and `Uint8Array` rows swapped (it says `Object` gets `application/octet-stream` and `Uint8Array` gets `application/x-www-form-urlencoded`), and that table is the mistake. The two pages contradict each other and the runtime sides with the `https.post` page.

## Decision

No rule relies on it. C-005 is verified. Part 1 of #71 is done; `createSecretKey` (needs an API secret, a write) and `sendRedirect` (needs two Suitelets) are still open.
