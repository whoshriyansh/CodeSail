import * as vscode from "vscode";
import { ViewProvider } from "./components/ViewProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "codesail" is now active!');

  const provider = new ViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ViewProvider.viewId, provider)
  );
}

export function deactivate() {}
