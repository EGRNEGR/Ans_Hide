export interface ScriptConfig {
  apiKey: string;
  model: string;
  captureHotkey: string;
  audioHotkey: string;
  hideHotkey: string;
  showHotkey: string;
  scrollUpHotkey: string;
  scrollDownHotkey: string;
  systemPrompt: string;
  audioPrompt: string;
  overlayWidth: number;
  overlayHeight: number;
  cornerMargin: number;
  autoHideSeconds: number;
  position: "bottom-right" | "top-right" | "bottom-left" | "top-left";
  excludeFromCapture: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  category: string;
  browserUrl: string;
  pageTitle: string;
  contentSnippet: string;
  mockAiAnswer: string;
}
