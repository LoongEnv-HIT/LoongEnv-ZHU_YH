import React from 'react';

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
}

export interface PluginComponentProps {
  data: any;
  onAction: (action: string, payload?: any) => void;
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
