// src/services/CodeAnalysisService.ts
import * as vscode from "vscode";
import { streamDeepSeekAnalysis } from "../api/CodeAnalysis/CodeAnalysis";

export function createCodeAnalysisService() {
  let webview: vscode.Webview | undefined;

  function setWebview(newWebview: vscode.Webview) {
    webview = newWebview;
  }

  async function analyzeCode(
    code: string,
    prompt: string,
    apiKey: string,
    onChunk: (chunk: any) => void,
    onComplete: (error?: string) => void
  ): Promise<void> {
    if (!webview) throw new Error("Webview not initialized");
    try {
      webview.postMessage({ command: "analysisStart" });
      await streamDeepSeekAnalysis(
        code,
        prompt,
        apiKey,
        (chunk) => {
          onChunk({
            ...chunk,
            prompt,
          });
        },
        (error) => {
          if (error) {
            onComplete(error);
          } else {
            onComplete();
            webview!.postMessage({ command: "analysisComplete" });
          }
        }
      );
    } catch (error) {
      throw new Error(`Analysis error: ${String(error)}`);
    }
  }

  return { setWebview, analyzeCode };
}
