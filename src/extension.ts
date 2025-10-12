import * as vscode from "vscode";
import * as fs from "fs/promises";
import { ViewProvider } from "./components/ViewProvider";
import { Groq } from "groq-sdk";
import axios, { AxiosError } from "axios";

export async function listAllWorkspaceFiles() {
  const excludePatterns = "**/{node_modules,dist,build,.git,.*}/**";
  try {
    const allFiles = await vscode.workspace.findFiles("**/*", excludePatterns);
    if (allFiles.length > 0) {
      vscode.window.showInformationMessage(
        `Found ${allFiles.length} files in the workspace.`
      );
      return allFiles;
    } else {
      vscode.window.showInformationMessage(
        "No important files found in the workspace."
      );
      return [];
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`Error listing files: ${error.message}`);
    return [];
  }
}

export async function readFileContent(filePath: string) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    vscode.window.showInformationMessage(`File content read successfully`);
    return content;
  } catch (error: any) {
    const errorMsg = `Error reading file: ${error.message}`;
    vscode.window.showErrorMessage(errorMsg);
    throw new Error(errorMsg);
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "codesail" is now active!');

  const provider = new ViewProvider(context.extensionUri, context); // Pass context
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ViewProvider.viewId, provider)
  );

  // Register the authenticate command
  context.subscriptions.push(
    vscode.commands.registerCommand("codesail.authenticate", async () => {
      provider.sendAuthRequest();
    })
  );
}

export function deactivate() {}
