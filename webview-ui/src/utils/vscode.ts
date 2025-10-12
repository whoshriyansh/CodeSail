import type { WebviewApi } from "vscode-webview";

// Singleton to store the VS Code API instance
let vscodeApi: WebviewApi<unknown> | null = null;

/**
 * Gets the VS Code Webview API instance, ensuring it's called only once.
 * Returns a mock in development mode if not running in VS Code.
 */
export function getVsCodeApi(): WebviewApi<unknown> {
  // Return cached instance if already acquired
  if (vscodeApi) {
    return vscodeApi;
  }

  // Try to acquire the API in VS Code environment
  if (typeof window.acquireVsCodeApi === "function") {
    try {
      vscodeApi = window.acquireVsCodeApi();
      console.log("VS Code API acquired successfully");
      return vscodeApi;
    } catch (e) {
      console.error("Failed to acquire VS Code API:", e);
    }
  }

  // Mock for development (e.g., running in browser)
  console.warn("acquireVsCodeApi not available. Running in development mode.");
  vscodeApi = {
    postMessage: (msg: any) => console.log("Mock postMessage:", msg),
    getState: () => undefined,
    setState: (state: any) => {
      console.log("Mock setState:", state);
      return state;
    },
  };
  return vscodeApi;
}
