import * as vscode from "vscode";
import { ViewProvider } from "./components/ViewProvider";

export async function listAllWorkspaceFiles() {
  // Define exclude patterns as a single string
  // Ignore node_modules, dist, build, .git, and hidden folders
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
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`Error listing files: ${error.message}`);
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "codesail" is now active!');

  const provider = new ViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ViewProvider.viewId, provider)
  );

  let disposable = vscode.commands.registerCommand("show.files", () => {
    vscode.window.showInformationMessage("This is the Text document");
  });

  context.subscriptions.push(disposable);
}
