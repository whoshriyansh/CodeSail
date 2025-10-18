import * as vscode from "vscode";
import { streamDeepSeekAnalysis } from "../api/CodeAnalysis/CodeAnalysis";

export function createCodeAnalysisService() {
  let webview: vscode.Webview | undefined;

  function setWebview(newWebview: vscode.Webview) {
    webview = newWebview;
  }

  async function analyzeCode(code: string, prompt: string) {
    if (!webview) throw new Error("Webview not initialized");
    try {
      // Send "thinking" status to frontend
      webview.postMessage({ command: "analysisStart", text: "Thinking..." });

      // Start streaming analysis
      await streamDeepSeekAnalysis(code, prompt, webview);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      webview.postMessage({ command: "error", text: `Analysis error: ${msg}` });
    }
  }

  return { setWebview, analyzeCode };
}
