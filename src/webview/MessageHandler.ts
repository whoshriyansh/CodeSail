// src/webview/MessageHandler.ts
import * as vscode from "vscode";
import { getWorkspaceFiles, readFile } from "../utils/FileOperations";
import { createApiKeyManager } from "../utils/ApiKeyManager";
import { authenticateGitHub, UserProfile } from "../auth/GitHubAuthHandler";
import { createCodeAnalysisService } from "../services/CodeAnalysisService";

interface Message {
  command: string;
  data?: any;
}

export function createMessageHandler(context: vscode.ExtensionContext) {
  let webview: vscode.Webview | undefined;
  const apiKeyManager = createApiKeyManager(context);
  const analysisService = createCodeAnalysisService();

  function setWebview(newWebview: vscode.Webview) {
    webview = newWebview;
    analysisService.setWebview(newWebview);
  }

  async function handleMessage(message: Message): Promise<void> {
    if (!webview) throw new Error("Webview not initialized");
    try {
      switch (message.command) {
        case "fetchdata":
          const files = await getWorkspaceFiles();
          webview.postMessage({ command: "all-files", data: files });
          break;

        case "Analyse File":
          if (
            !message.data?.filePath ||
            !message.data?.prompt ||
            !message.data?.fileName
          ) {
            webview.postMessage({
              command: "error",
              text: "Missing file or prompt for analysis.",
            });
            return;
          }

          const code = await readFile(message.data.filePath);
          if (!code) return;

          const apiKey = await apiKeyManager.getApiKey();
          if (!apiKey) {
            webview.postMessage({
              command: "error",
              text: "Grok API key not configured. Please submit your key.",
            });
            return;
          }

          await analysisService.analyzeCode(
            code,
            message.data.prompt,
            apiKey,
            (chunk) =>
              webview!.postMessage({ command: "analysisChunk", data: chunk }),
            (error) =>
              webview!.postMessage({
                command: error ? "error" : "analysisComplete",
                text: error,
              })
          );
          break;

        case "Github Authentication":
          const userProfile = await authenticateGitHub();
          webview.postMessage({ command: "userProfile", data: userProfile });
          vscode.window.showInformationMessage(
            "Successfully authenticated with GitHub!"
          );
          break;

        case "Submit Grok Key":
          await apiKeyManager.saveApiKey();
          webview.postMessage({
            command: "keySaved",
            text: "Grok API key saved successfully!",
          });
          break;

        default:
          webview.postMessage({
            command: "error",
            text: `Unknown command: ${message.command}`,
          });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`${message.command} error:`, msg, error);
      webview.postMessage({ command: "error", text: msg });
    }
  }

  return { setWebview, handleMessage };
}
