export type DesktopPlatform = "electron";

export interface DesktopDevice {
  id: string;
  name: string;
  platform: DesktopPlatform;
  state: "available" | "unavailable" | "unknown";
}

export interface PrerequisiteIssue {
  check: string;
  passed: boolean;
  hint?: string;
  autoFixable?: boolean;
}

export interface DesktopPrerequisiteCheck {
  platform: DesktopPlatform;
  available: boolean;
  canProceed?: boolean;
  issues: PrerequisiteIssue[];
  devices: DesktopDevice[];
}

export interface ResolvedElectronLaunchTarget {
  platform: "electron";
  appPath: string;
  launchCommand?: string;
  workingDirectory?: string;
  source: "memory" | "config" | "project";
  detectedFrom: string;
}

export type ResolvedDesktopLaunchTarget = ResolvedElectronLaunchTarget;
