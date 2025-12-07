export interface FileWithContent {
  name: string;
  path: string;
  content: File;
}

export interface AppConfig {
  appName: string;
  bundleId: string;
  version: string;
  orientation: 'portrait' | 'landscape' | 'all';
  statusBarHidden: boolean;
}

export enum ConversionStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPRESSING = 'COMPRESSING',
  READY = 'READY',
  ERROR = 'ERROR'
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
