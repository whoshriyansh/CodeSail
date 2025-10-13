// src/utils/ApiKeyManager.ts
import * as vscode from "vscode";

export function createApiKeyManager(context: vscode.ExtensionContext) {
  async function getApiKey(): Promise<string | undefined> {
    return context.secrets.get("grokApiKey");
  }

  async function saveApiKey(): Promise<void> {
    try {
      const input = await vscode.window.showInputBox({
        prompt: "Enter your Grok API key (from console.x.ai)",
        password: true,
        ignoreFocusOut: true,
      });
      if (!input) {
        throw new Error("No API key provided.");
      }
      await context.secrets.store("grokApiKey", input);
    } catch (error) {
      throw new Error(`Failed to save API key: ${String(error)}`);
    }
  }

  return { getApiKey, saveApiKey };
}
