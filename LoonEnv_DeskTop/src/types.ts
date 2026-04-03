import React from 'react';

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
}

export interface PluginComponentProps {
  data: PluginData;
  onAction: (action: string, payload?: any) => void;
}

export interface DefineArtifact {
  robotModel: string;
  sourceType: string;
  sourcePath: string;
  jointConfiguration: string;
  jointLimitStatus: string;
  environment: {
    ground: string;
    lighting: string;
    showcasePose: string;
  };
  assetsSummary: string;
}

export interface DefineProjectConfig {
  robotModel: string;
  sourceType: string;
  sourcePath: string;
  ground: string;
  lighting: string;
}

export interface DesignProjectConfig {
  algorithmModuleId?: string;
  algorithmCategoryId?: string;
  algorithmId?: string;
}

export interface DeployProjectConfig {
  hardwareTarget: string;
  targetHost: string;
  controlFrequencyHz: number;
}

export interface DiagnoseProjectConfig {
  streamUrl: string;
  selectedMetrics: string[];
}

export interface UiProjectConfig {
  activeModuleId: string;
  sidebarVisible: boolean;
  sidebarWidth: number;
  bottomPanelHeight: number;
}

export interface ProjectConfig {
  version: number;
  define: DefineProjectConfig;
  design: DesignProjectConfig;
  deploy: DeployProjectConfig;
  diagnose: DiagnoseProjectConfig;
  ui: UiProjectConfig;
}

export interface DesignWorkflowStep {
  title: string;
  summary: string;
}

export interface DesignAlgorithmMode {
  mode: string;
  meaning: string;
}

export interface DesignAlgorithmMetricDefinition {
  name: string;
  meaning: string;
}

export interface DesignAlgorithmEntry {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string;
  family: string;
  taskType: string;
  candidateStructure: string;
  backendModuleId: string;
  backendModuleName: string;
  backendSummary: string;
  supportedRobotModels?: readonly string[];
  whyItMatters: string;
  synthesisFlow: readonly DesignWorkflowStep[];
  modes: readonly DesignAlgorithmMode[];
  metrics: readonly DesignAlgorithmMetricDefinition[];
  validationGates: readonly string[];
}

export interface DesignAlgorithmModule {
  id: string;
  name: string;
  description: string;
  algorithms: readonly DesignAlgorithmEntry[];
}

export type DesignJobState = 'draft' | 'configured' | 'optimizing' | 'validated' | 'exported' | 'error';

export interface DesignMetricValue {
  name: string;
  value: string;
  status?: 'info' | 'good' | 'warn';
}

export interface DesignJobArtifact {
  specId: string;
  controllerProfile: string;
  ffMode: string;
  optimizer: string;
}

export interface DesignJob {
  id: string;
  state: DesignJobState;
  title: string;
  sample: string;
  basedOn?: DefineArtifact;
  currentStage: string;
  summary: string;
  metrics: readonly DesignMetricValue[];
  artifacts: DesignJobArtifact;
  backendMode?: 'mock' | 'perfopt-http';
  backendJobId?: string;
  executionRobotModel?: string;
  resolvedMjcfPath?: string;
  error?: string;
}

export interface PluginData {
  defineArtifact?: DefineArtifact;
  designJob?: DesignJob;
  projectConfig?: ProjectConfig;
  availableDesignModules?: readonly DesignAlgorithmModule[];
  selectedDesignModule?: DesignAlgorithmModule;
  selectedDesignAlgorithm?: DesignAlgorithmEntry;
}

export type RuntimeLogLevel = 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';

export interface RuntimeLogEntry {
  id: string;
  timestamp: string;
  level: RuntimeLogLevel;
  message: string;
}

export interface Plugin {
  metadata: PluginMetadata;
  icon: React.ReactNode;
  stepTitle: string;
  component: React.FC<PluginComponentProps>;
  techStack: string[];
  inputSchema: any;
  outputSchema: any;
}
