// SuiteScript script types and the entry points each one supports.
export interface ScriptType {
  name: string;
  entryPoints: string[];
}

export const SCRIPT_TYPES: ScriptType[] = [
  {
    entryPoints: [
      "getRequiredConfigurationFields",
      "downloadPreviousDayBankStatementFile",
    ],
    name: "BankConnectivityPlugin",
  },
  {
    entryPoints: [
      "afterInstall",
      "afterUpdate",
      "beforeInstall",
      "beforeUninstall",
      "beforeUpdate",
    ],
    name: "BundleInstallationScript",
  },
  {
    entryPoints: [
      "fieldChanged",
      "lineInit",
      "pageInit",
      "postSourcing",
      "saveRecord",
      "sublistChanged",
      "validateDelete",
      "validateField",
      "validateInsert",
      "validateLine",
      "localizationContextEnter",
      "localizationContextExit",
    ],
    name: "ClientScript",
  },
  {
    entryPoints: ["customizeGlImpact"],
    name: "CustomGLPlugin",
  },
  {
    entryPoints: [],
    name: "CustomTool",
  },
  {
    entryPoints: ["createDataset"],
    name: "DatasetBuilderPlugin",
  },
  {
    entryPoints: [
      "getConfigurationIFrameUrl",
      "getAccounts",
      "getTransactionData",
    ],
    name: "FiConnectivityPlugin",
  },
  {
    entryPoints: [
      "parseData",
      "getStandardTransactionCodes",
      "getExpenseCodes",
      "getConfigurationPageUrl",
    ],
    name: "FiParserPlugin",
  },
  {
    entryPoints: ["getInputData", "map", "reduce", "summarize"],
    name: "MapReduceScript",
  },
  {
    entryPoints: ["each"],
    name: "MassUpdateScript",
  },
  {
    entryPoints: [],
    name: "PluginTypeImpl",
  },
  {
    entryPoints: ["render"],
    name: "Portlet",
  },
  {
    entryPoints: ["delete", "get", "post", "put"],
    name: "Restlet",
  },
  {
    entryPoints: ["execute"],
    name: "ScheduledScript",
  },
  {
    entryPoints: ["run"],
    name: "SDFInstallationScript",
  },
  {
    entryPoints: ["run"],
    name: "SpaClientScript",
  },
  {
    entryPoints: ["initializeSpa"],
    name: "SpaServerScript",
  },
  {
    entryPoints: ["onRequest"],
    name: "Suitelet",
  },
  {
    entryPoints: ["afterSubmit", "beforeLoad", "beforeSubmit"],
    name: "UserEventScript",
  },
  {
    entryPoints: ["createWorkbook"],
    name: "WorkbookBbuilderPlugin",
  },
  {
    entryPoints: ["onAction"],
    name: "WorkflowActionScript",
  },
];
