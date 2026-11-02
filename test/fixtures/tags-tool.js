/**
 * @NApiVersion 2.1
 * @NScriptType CustomTool
 */
define(["N/https", "N/record"], (https, record) => ({
  lookup: () => [https, record],
}));
