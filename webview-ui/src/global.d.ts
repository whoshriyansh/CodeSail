import { WebviewApi } from "vscode-webview";

declare global {
  interface Window {
    acquireVsCodeApi: <StateType = unknown>() => WebviewApi<StateType>;
  }
}

export {};
