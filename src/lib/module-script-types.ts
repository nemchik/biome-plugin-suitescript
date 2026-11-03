// Which side of NetSuite a script type runs on, and the N/ modules that only
// work on one side. From the "Supported Script Types" column of Oracle's SuiteScript
// module reference; loading a module on the wrong side fails at runtime.
// N/ui/message is not listed although the table marks it client-only: Oracle's
// Form.addPageInitMessage (Suitelets and user event beforeLoad) takes a
// message.create() object, its FAQ sample builds one in a Suitelet, and production
// user event scripts load the module. Only its show() and hide() need a browser.
// Pure logic shared by the Biome rules and the CLI.

export type ScriptSide = "client" | "server";

export const CLIENT_ONLY_MODULES = new Set([
  "N/currentRecord",
  "N/portlet",
  "N/ui/dialog",
]);

export const SERVER_ONLY_MODULES = new Set([
  "N/auth",
  "N/cache",
  "N/certificateControl",
  "N/compress",
  "N/config",
  "N/crypto",
  "N/crypto/certificate",
  "N/dataset",
  "N/documentCapture",
  "N/encode",
  "N/error",
  "N/file",
  "N/https/clientCertificate",
  "N/keyControl",
  "N/llm",
  "N/machineTranslation",
  "N/pgp",
  "N/piremoval",
  "N/plugin",
  "N/redirect",
  "N/render",
  "N/sftp",
  "N/task",
  "N/task/accounting/recognition",
  "N/ui/serverWidget",
  "N/workbook",
  "N/workflow",
]);

/** The side shared by every candidate script type, or undefined when unknown or mixed. */
export function sideOf(
  types: readonly { name: string }[],
): ScriptSide | undefined {
  if (types.length === 0) return undefined;
  const clients = types.filter((t) => t.name === "ClientScript").length;
  if (clients === types.length) return "client";
  return clients === 0 ? "server" : undefined;
}

/** A message when `module` cannot be loaded by a script on `side`. */
export function misplacedModule(
  side: ScriptSide,
  module: string,
): string | undefined {
  if (side === "server" && CLIENT_ONLY_MODULES.has(module))
    return `${module} is only available in client scripts.`;
  if (side === "client" && SERVER_ONLY_MODULES.has(module))
    return `${module} is only available in server scripts.`;
  return undefined;
}

const CUSTOM_TOOL_UNSUPPORTED = new Set([
  "N/http",
  "N/https",
  "N/llm",
  "N/sftp",
]);

/** A message when a single script type cannot load `module` at all. */
export function unsupportedModule(
  scriptType: string,
  module: string,
): string | undefined {
  if (scriptType === "CustomTool" && CUSTOM_TOOL_UNSUPPORTED.has(module))
    return `${module} is not supported in custom tool scripts.`;
  if (scriptType === "BundleInstallationScript" && !/^N(\/|$)/.test(module))
    return "Custom modules are not supported in bundle installation scripts.";
  return undefined;
}
