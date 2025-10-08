import * as vscode from "vscode";
import { ViewProvider } from "./components/ViewProvider";
import path from "path";

async function listAllWorkspaceFiles() {
  // Define exclude patterns as a single string
  // Ignore node_modules, dist, build, .git, and hidden folders
  const excludePatterns =
    "**/node_modules/**,**/dist/**,**/build/**,**/.git/**,**/.*/**";

  // Define important file extensions
  const importantExtensions = [
    ".ts",
    ".js",
    ".jsx",
    ".tsx",
    ".html",
    ".css",
    ".json",
  ];
  try {
    const allFiles = await vscode.workspace.findFiles("**/*", excludePatterns);

    const importantFiles = allFiles.filter((file) => {
      const filePath = file.fsPath;
      const isOuterLevel =
        !filePath.includes("/node_modules/") &&
        !filePath.includes("/dist/") &&
        !filePath.includes("/build/"); // Avoid nested in ignored dirs
      const extension = path.extname(filePath).toLowerCase();
      return isOuterLevel && importantExtensions.includes(extension);
    });

    // Get currently open files from tabs
    const openFiles = vscode.window.tabGroups.all
      .flatMap((group) => group.tabs)
      .map((tab) =>
        tab.input instanceof vscode.TabInputText ? tab.input.uri : null
      )
      .filter((uri): uri is vscode.Uri => uri !== null);

    // Merge important files with open files, removing duplicates by URI
    const uniqueFiles = new Map<string, vscode.Uri>();
    [...importantFiles, ...openFiles].forEach((file) => {
      uniqueFiles.set(file.toString(), file);
    });
    const mergedFiles = Array.from(uniqueFiles.values());

    // Limit to 15 files, prioritizing open files
    const finalFiles = mergedFiles.slice(0, 40); // Cap at 15

    if (finalFiles.length > 0) {
      vscode.window.showInformationMessage(
        `Found ${finalFiles.length} files in the workspace.`
      );
      finalFiles.forEach((file) => {
        console.log(file.fsPath); // Log the full path
      });
    } else {
      vscode.window.showInformationMessage(
        "No important files found in the workspace."
      );
    }

    // Optionally, send to webview (e.g., for display in Homepage.tsx)
    if (vscode.extensions.getExtension("your-extension-id")) {
      const webview =
        vscode.window.activeTextEditor?.viewColumn === vscode.ViewColumn.One
          ? vscode.window.createWebviewPanel(
              "codesailFiles",
              "Workspace Files",
              vscode.ViewColumn.One,
              {}
            )
          : null;
      if (webview) {
        webview.webview.postMessage({
          command: "fileList",
          data: finalFiles.map((f) => ({
            name: path.basename(f.fsPath),
            uri: f.toString(),
          })),
        });
      }
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
    listAllWorkspaceFiles();
  });

  context.subscriptions.push(disposable);
}
