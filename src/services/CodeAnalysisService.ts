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

    console.log("Starting code analysis with prompt:", prompt);
    webview.postMessage({
      command: "analysisStart",
      data: { text: "Starting code analysis..." },
    });

    try {
      const response = await streamDeepSeekAnalysis(code, prompt);
      console.log("Received response from streamDeepSeekAnalysis:", response);

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

    console.log("Response sent to webview");
  }

  return { setWebview, analyzeCode };
}
