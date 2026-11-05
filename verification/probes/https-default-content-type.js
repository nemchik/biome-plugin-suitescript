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
        body,
        headers,
        url: "https://httpbin.org/post",
      });
      const seen = JSON.parse(res.body).headers;
      return seen["Content-Type"] || "(none)";
    };
    t("string body, no headers", () => echo("a=1"));
    t("object body, no headers", () => echo({ a: "1" }));
    t("JSON string body, no headers", () => echo(JSON.stringify({ a: 1 })));
    t("Uint8Array body, no headers", () => echo(new Uint8Array([97, 61, 49])));
    return result;
  },
}));
