// Simplified app mode - canvas-centric with optional views
export enum AppMode {
  CANVAS = 'CANVAS',      // Primary drawing mode
  HISTORY = 'HISTORY',    // Viewing version history/timelapse
  BUILD = 'BUILD',        // Final build plan view
}

export interface Diagram {
  id: string;
  name: string;
  dataUrl: string | null;
  type: 'main' | 'sub';
}

export interface ComponentSpec {
  id: string;
  name: string;
  description: string;
  userNotes: string;
}

// Version processing status
export type VersionStatus = 'pending' | 'refining' | 'specifying' | 'complete' | 'error';

// A single version snapshot capturing the state after an "Update"
export interface DiagramVersion {
  id: string;
  versionNumber: number;
  timestamp: number;
  diagrams: Diagram[];           // Raw sketches at this version
  refinedImage: string | null;   // AI-refined result (may be pending)
  specs: ComponentSpec[];        // Generated specifications (may be pending)
  buildPlan?: string;            // Cached build plan markdown
  status: VersionStatus;
  error?: string;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

export { };
