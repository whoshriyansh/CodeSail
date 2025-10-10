import * as vscode from "vscode";
import * as fs from "fs/promises";
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

//Function to read the content of the file and return it as a file.
export async function readFileContent(filePath: string) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    vscode.window.showInformationMessage(`File content: ${content}`);
    return content;
  } catch (error: any) {
    const errorMsg = `Error while Keeping reading the file: ${error.message}`;
    vscode.window.showErrorMessage(`Error reading file: ${error.message}`);
    throw new Error(errorMsg);
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
