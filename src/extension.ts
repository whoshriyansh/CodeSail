import * as vscode from "vscode";
import { ViewProvider } from "./components/ViewProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "codesail" is now active!');

  const provider = new ViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ViewProvider.viewId, provider)
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  // const disposable = vscode.commands.registerCommand(
  //   "codesail.helloWorld",
  //   () => {
  //     vscode.window.showErrorMessage("There is an error");
  //     vscode.window.showInformationMessage("Hello World from codesail!");
  //   }
  // );

  // context.subscriptions.push(disposable);
}

export function deactivate() {}
