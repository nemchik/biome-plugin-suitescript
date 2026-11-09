import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { htmlToText, resolveUrl } from "../scripts/oracle-doc.ts";

const script = fileURLToPath(
  new URL("../scripts/oracle-doc.ts", import.meta.url),
);

test("resolveUrl accepts section ids and docs.oracle.com URLs", () => {
  const expected =
    "https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_42.html";
  assert.equal(resolveUrl("section_42"), expected);
  assert.equal(resolveUrl("42"), expected);
  assert.equal(resolveUrl(expected), expected);
});

test("resolveUrl rejects other hosts and malformed ids", () => {
  assert.throws(() => resolveUrl("https://example.com/x.html"));
  assert.throws(() => resolveUrl("http://docs.oracle.com/x.html"));
  assert.throws(() => resolveUrl("not an id"));
});

test("htmlToText strips tags and scripts, keeps blocks and decodes entities", () => {
  const text = htmlToText(
    "<html><head><title>t</title></head><body><script>x()</script><h1>A &amp; B</h1><p>one<br>two &#65;</p><ul><li>x</li><li>y</li></ul></body></html>",
  );
  assert.equal(text, "A & B\none\ntwo A\nx\ny");
});

test("a bad argument exits non-zero with a message", () => {
  const result = spawnSync(process.execPath, [script, "not an id"], {
    encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /oracle-doc failed/);
});

test("no argument exits non-zero with usage", () => {
  const result = spawnSync(process.execPath, [script], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Usage/);
});

test("htmlToText leaves no tag behind when a removed piece would join its neighbours", () => {
  assert.doesNotMatch(htmlToText("a<scr<!-- -->ipt>b"), /<script/i);
  assert.doesNotMatch(htmlToText("<<script>x</script>b>c"), /<\/?script/i);
});
