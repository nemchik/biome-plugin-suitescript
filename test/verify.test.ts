import assert from "node:assert/strict";
import { generateKeyPairSync, verify } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { Script } from "node:vm";
import { type DoctorContext, runChecks } from "../scripts/verify/doctor.ts";
import {
  applyEnvUpdate,
  parseEnv,
  planEnvUpdate,
} from "../scripts/verify/envfile.ts";
import {
  assertSandbox,
  clientAssertion,
  generateRunner,
  isSandboxAccount,
  matchesExpect,
  parseProbe,
  readConfig,
  restletUrl,
  runnerTemplate,
  scrub,
  tokenUrl,
} from "../scripts/verify/lib.ts";

test("only a sandbox account id is accepted", () => {
  assert.ok(isSandboxAccount("1234567_SB1"));
  assert.ok(isSandboxAccount("1234567_sb2"));
  assert.ok(!isSandboxAccount("1234567"));
  assert.ok(!isSandboxAccount("1234567_RP1"));
  assert.ok(!isSandboxAccount("TSTDRV1234567"));
  assert.throws(() => assertSandbox("1234567"), /sandbox/);
});

test("endpoints use the lowercase hyphenated account host", () => {
  assert.equal(
    tokenUrl("1234567_SB1"),
    "https://1234567-sb1.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token",
  );
  assert.match(
    restletUrl("1234567_SB1"),
    /^https:\/\/1234567-sb1\.restlets\.api\.netsuite\.com\/app\/site\/hosting\/restlet\.nl\?script=customscript_biome_verification_runner&deploy=customdeploy_biome_verification_runner$/,
  );
});

test("readConfig reports every missing variable", () => {
  const { config, missing } = readConfig({});
  assert.equal(config, undefined);
  assert.equal(missing.length, 6);
  const ok = readConfig({
    SUITESCRIPT_VERIFY_ACCOUNT: "1234567_SB1",
    SUITESCRIPT_VERIFY_CERTIFICATE_ID: "cert",
    SUITESCRIPT_VERIFY_CLIENT_ID: "client",
    SUITESCRIPT_VERIFY_PRIVATE_KEY_PATH: "/k.pem",
    SUITESCRIPT_VERIFY_SDF_CERTIFICATE_ID: "sdf-cert",
    SUITESCRIPT_VERIFY_SDF_PRIVATE_KEY_PATH: "/sdf.pem",
  });
  assert.equal(ok.config?.clientId, "client");
  assert.equal(ok.config?.sdfCertificateId, "sdf-cert");
});

test("the client assertion is an ES256 JWT that verifies with the public key", () => {
  const { privateKey, publicKey } = generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
  });
  const pem = privateKey.export({ format: "pem", type: "pkcs8" }).toString();
  const jwt = clientAssertion({
    certificateId: "cert-id",
    clientId: "client-id",
    now: 1_700_000_000_000,
    privateKeyPem: pem,
    tokenEndpoint: "https://example.invalid/token",
  });
  const [header, claims, signature] = jwt.split(".") as [
    string,
    string,
    string,
  ];
  assert.deepEqual(JSON.parse(Buffer.from(header, "base64url").toString()), {
    alg: "ES256",
    kid: "cert-id",
    typ: "JWT",
  });
  const parsed = JSON.parse(Buffer.from(claims, "base64url").toString()) as {
    aud: string;
    exp: number;
    iat: number;
    iss: string;
    scope: string;
  };
  assert.equal(parsed.iss, "client-id");
  assert.equal(parsed.scope, "restlets");
  assert.equal(parsed.aud, "https://example.invalid/token");
  assert.ok(parsed.exp - parsed.iat < 3600, "exp must be under 60 minutes");
  assert.ok(
    verify(
      "sha256",
      Buffer.from(`${header}.${claims}`),
      { dsaEncoding: "ieee-p1363", key: publicKey },
      Buffer.from(signature, "base64url"),
    ),
  );
});

test("a key that is not P-256 is rejected", () => {
  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "secp384r1" });
  assert.throws(
    () =>
      clientAssertion({
        certificateId: "c",
        clientId: "c",
        privateKeyPem: privateKey
          .export({ format: "pem", type: "pkcs8" })
          .toString(),
        tokenEndpoint: "https://example.invalid/token",
      }),
    /P-256/,
  );
});

test("scrub replaces the configured ids and fails closed on lookalikes", () => {
  const known = {
    account: "1234567_SB1",
    certificateId: "certabc123",
    clientId: "clientxyz789",
  };
  const clean = scrub("host 1234567-sb1 id certabc123", known);
  assert.equal(clean.text, "host <ACCOUNT> id <CERTIFICATE-ID>");
  assert.deepEqual(clean.problems, []);

  for (const bad of [
    "7654321_SB2",
    "TSTDRV1234567",
    "https://x.app.netsuite.com/a",
    "eyJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJhYmMifQ.sig",
    "a".repeat(40),
    "-----BEGIN PRIVATE KEY-----",
    "someone@example.com",
  ]) {
    assert.notDeepEqual(scrub(bad, known).problems, [], bad);
  }
});

test("parseProbe reads the tags of the leading JSDoc block", () => {
  const probe = parseProbe(
    "x",
    `/**
 * Text.
 *
 * @NApiVersion 2.1
 * @scriptType Restlet
 * @contradiction C-010
 * @contradiction C-011
 * @rule preferUtilEach
 * @writes
 */
define([], () => ({}));
// @contradiction C-999 outside the block`,
  );
  assert.deepEqual(probe.contradictions, ["C-010", "C-011"]);
  assert.deepEqual(probe.rules, ["preferUtilEach"]);
  assert.equal(probe.scriptType, "Restlet");
  assert.equal(probe.writes, true);
  assert.equal(probe.tooling, false);
});

test("the runner lists exactly the probes it is given and no request code path", () => {
  const source = generateRunner(
    ["a-probe", "b-probe"],
    'define(["N/runtime" /*PROBE_PATHS*/], (runtime /*PROBE_NAMES*/) => { new Map([/*PROBE_ENTRIES*/]); });',
  );
  assert.match(source, /"\.\/probes\/a-probe", "\.\/probes\/b-probe"/);
  assert.match(source, /\(runtime\s*, probe0, probe1\)/);
  assert.match(source, /\["a-probe", probe0\], \["b-probe", probe1\]/);
  assert.doesNotMatch(source, /\beval\b|new Function/);
});

test("the generated runner from the real template is valid JavaScript", () => {
  const template = readFileSync(runnerTemplate, "utf8");
  for (const slugs of [[], ["a-probe"], ["a-probe", "b-probe"]]) {
    const source = generateRunner(slugs, template);
    assert.doesNotMatch(source, /PROBE_/, "a placeholder was not replaced");
    // Compiling (not running) catches a broken list, like a missing comma.
    new Script(source);
  }
});

test("matchesExpect compares structurally", () => {
  assert.ok(matchesExpect({ a: [1, 2] }, { a: [1, 2] }));
  assert.ok(!matchesExpect({ a: 1 }, { a: 2 }));
});

function context(overrides: Partial<DoctorContext> = {}): DoctorContext {
  const files = new Map<string, string>();
  return {
    env: {},
    exists: (path) => files.has(path),
    home: "/home/u",
    keyType: () => "other",
    mode: () => undefined,
    nodeVersion: "24.22.2",
    platform: "linux",
    readText: (path) => files.get(path) ?? "",
    repoRoot: "/repo",
    run: () => ({ output: 'openjdk version "21.0.1"', status: 0 }),
    ...overrides,
  };
}

test("the doctor fails every manual step on a bare machine and says what to do", () => {
  const files = new Map([
    [
      "/repo/package.json",
      JSON.stringify({
        devDependencies: { "@oracle/suitecloud-cli": "4.1.1" },
      }),
    ],
  ]);
  const checks = runChecks(
    context({
      exists: (path) => files.has(path),
      readText: (path) => files.get(path) ?? "{}",
    }),
  );
  const failing = checks.filter((check) => !check.ok);
  assert.ok(failing.length >= 6);
  for (const check of failing) assert.ok(check.next, check.name);
  assert.ok(checks.find((c) => c.name.startsWith("Node"))?.ok);
  assert.ok(checks.find((c) => c.name.includes("JDK"))?.ok);
});

test("the doctor refuses a production account and two passkeys", () => {
  const checks = runChecks(
    context({
      env: {
        SUITECLOUD_CI_PASSKEY: "a".repeat(40),
        SUITECLOUD_FALLBACK_PASSKEY: "b".repeat(40),
        SUITESCRIPT_VERIFY_ACCOUNT: "1234567",
        SUITESCRIPT_VERIFY_CERTIFICATE_ID: "c",
        SUITESCRIPT_VERIFY_CLIENT_ID: "c",
        SUITESCRIPT_VERIFY_PRIVATE_KEY_PATH: "/k.pem",
        SUITESCRIPT_VERIFY_SDF_CERTIFICATE_ID: "c",
        SUITESCRIPT_VERIFY_SDF_PRIVATE_KEY_PATH: "/s.pem",
      },
      readText: () => "{}",
    }),
  );
  const by = (name: string) => checks.find((c) => c.name.includes(name));
  assert.equal(by("is a sandbox")?.ok, false);
  assert.equal(by("FALLBACK_PASSKEY")?.ok, false);
  assert.equal(by("PASSKEY (or SUITECLOUD_CI_PASSKEY) is set")?.ok, true);
});

test("env file updates keep other lines and never replace a value without permission", () => {
  const text = "# mine\nSUITESCRIPT_VERIFY_ACCOUNT=old\nOTHER=1\n";
  const entries = {
    SUITESCRIPT_VERIFY_ACCOUNT: "new",
    SUITESCRIPT_VERIFY_CLIENT_ID: "client",
  };
  const plan = planEnvUpdate(text, entries);
  assert.deepEqual(plan.conflicts, ["SUITESCRIPT_VERIFY_ACCOUNT"]);
  assert.deepEqual(plan.fresh, ["SUITESCRIPT_VERIFY_CLIENT_ID"]);

  const kept = applyEnvUpdate(text, entries, new Set());
  assert.match(kept, /SUITESCRIPT_VERIFY_ACCOUNT=old/);
  assert.match(kept, /SUITESCRIPT_VERIFY_CLIENT_ID=client/);
  assert.match(kept, /# mine/);
  assert.match(kept, /OTHER=1/);

  const replaced = applyEnvUpdate(
    text,
    entries,
    new Set(["SUITESCRIPT_VERIFY_ACCOUNT"]),
  );
  assert.match(replaced, /SUITESCRIPT_VERIFY_ACCOUNT=new/);
  assert.doesNotMatch(replaced, /=old/);
});

const windowsPath = String.raw`C:\Users\me\a key\private.pem`;

test("env file values round-trip, with Windows paths written with forward slashes", () => {
  const written = applyEnvUpdate(
    "",
    { SUITESCRIPT_VERIFY_PRIVATE_KEY_PATH: windowsPath },
    new Set(),
  );
  assert.match(written, /^# Local configuration/);
  assert.equal(
    parseEnv(written).get("SUITESCRIPT_VERIFY_PRIVATE_KEY_PATH"),
    "C:/Users/me/a key/private.pem",
  );
  const same = planEnvUpdate(written, {
    SUITESCRIPT_VERIFY_PRIVATE_KEY_PATH: windowsPath,
  });
  assert.deepEqual(same.same, ["SUITESCRIPT_VERIFY_PRIVATE_KEY_PATH"]);
});

test("the doctor wants an EC P-256 runner key and an RSA SDF key", () => {
  const env = {
    SUITESCRIPT_VERIFY_ACCOUNT: "1234567_SB1",
    SUITESCRIPT_VERIFY_CERTIFICATE_ID: "c",
    SUITESCRIPT_VERIFY_CLIENT_ID: "c",
    SUITESCRIPT_VERIFY_PRIVATE_KEY_PATH: "/runner.pem",
    SUITESCRIPT_VERIFY_SDF_CERTIFICATE_ID: "c",
    SUITESCRIPT_VERIFY_SDF_PRIVATE_KEY_PATH: "/sdf.pem",
  };
  const check = (types: Record<string, string>, name: string) =>
    runChecks(
      context({
        env,
        exists: () => true,
        keyType: (path) => types[path] ?? "other",
        readText: () => "{}",
      }),
    ).find((c) => c.name.includes(name));

  const good = { "/runner.pem": "ec:prime256v1", "/sdf.pem": "rsa:4096" };
  assert.equal(check(good, "runner private key is an EC")?.ok, true);
  assert.equal(check(good, "SDF private key is an RSA")?.ok, true);

  const swapped = { "/runner.pem": "rsa:4096", "/sdf.pem": "ec:prime256v1" };
  assert.equal(check(swapped, "runner private key is an EC")?.ok, false);
  assert.equal(check(swapped, "SDF private key is an RSA")?.ok, false);
  assert.equal(
    check({ ...good, "/sdf.pem": "rsa:2048" }, "SDF private key is an RSA")?.ok,
    false,
  );
});
