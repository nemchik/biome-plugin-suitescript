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
    entryPoints: [],
    name: "ConsolidatedRateAdjustorPlugin",
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
    entryPoints: [],
    name: "EmailCapturePlugin",
  },
  {
    entryPoints: ["handle"],
    name: "EventSubscriber",
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
    name: "PaymentGatewayPlugin",
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
    entryPoints: [],
    name: "PromotionsPlugin",
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
    entryPoints: [],
    name: "ShippingPartnersPlugin",
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
    entryPoints: [],
    name: "TaxCalculationPlugin",
  },
  {
    entryPoints: ["afterSubmit", "beforeLoad", "beforeSubmit"],
    name: "UserEventScript",
  },
  {
    entryPoints: ["createWorkbook"],
    name: "WorkbookBuilderPlugin",
  },
  {
    entryPoints: ["onAction"],
    name: "WorkflowActionScript",
  },
];
