// src/webview/ViewProvider.ts
import * as vscode from "vscode";
import { getWebviewContent } from "./WebviewContentProvider";
import { createMessageHandler } from "./MessageHandler";

export function createViewProvider(
  extensionUri: vscode.Uri,
  context: vscode.ExtensionContext
): vscode.WebviewViewProvider & {
  viewId: string;
  sendAuthRequest: () => Promise<void>;
} {
  let webview: vscode.Webview | undefined;
  const messageHandler = createMessageHandler(context);

  async function sendAuthRequest() {
    if (webview) {
      webview.postMessage({ command: "Github Authentication" });
    }
  }

  function resolveWebviewView(
    webviewView: vscode.WebviewView,
    webviewContext: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webview = webviewView.webview;
    messageHandler.setWebview(webview);

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [extensionUri],
    };

    webviewView.webview.html = getWebviewContent(extensionUri, webview);

    webviewView.webview.onDidReceiveMessage((message) =>
      messageHandler.handleMessage(message)
    );
  }

  return {
    viewId: "codesailView",
    resolveWebviewView,
    sendAuthRequest,
  };
}
