import * as vscode from "vscode";
import { streamDeepSeekAnalysis } from "../api/CodeAnalysis/CodeAnalysis";

export function createCodeAnalysisService() {
  let webview: vscode.Webview | undefined;

  function setWebview(newWebview: vscode.Webview) {
    webview = newWebview;
  }

  async function analyzeCode(code: string, prompt: string) {
    if (!webview) {
      console.error("Webview not initialized");
      throw new Error("Webview not initialized");
    }

    webview.postMessage({
      command: "analysisStart",
      data: { text: "Starting code analysis..." },
    });

    try {
      const response = await streamDeepSeekAnalysis(code, prompt);

      // Send the final response directly
      webview.postMessage({
        command: "final",
        text: JSON.stringify(response),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Analysis error:", message);
      webview.postMessage({
        command: "error",
        text: `Analysis failed: ${message}`,
      });
    }
  }

  return { setWebview, analyzeCode };
}
