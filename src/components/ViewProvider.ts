import * as vscode from "vscode";
import * as path from "path";

export class ViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = "codesailView";

  private _webview?: vscode.Webview; // Store for sending messages back

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._webview = webviewView.webview; // Save reference

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // using onDidReceiveMessage api for getting command and featching data from the react view pannel
    webviewView.webview.onDidReceiveMessage(async (message) => {
      console.log("Extension received message:", message);

      //If statement for featching data for the specific command
      //TODO: Use switch statement here
      if (message.command === "fetchdata") {
        try {
          const response = await fetch(message.url, { method: message.method });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          this._webview?.postMessage({ command: "apiResponse", data });
        } catch (error) {
          console.error("Fetch error:", error);
          this._webview?.postMessage({
            command: "error",
            text: (error as Error).message,
          });
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "webview-ui",
        "build",
        "assets",
        "index.js"
      )
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "webview-ui",
        "build",
        "assets",
        "index.css"
      )
    );

    const cspSource = `default-src 'none'; style-src ${webview.cspSource}; script-src ${webview.cspSource};`;
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="${cspSource}">
        <title>CodeSail</title>
        <link href="${styleUri}" rel="stylesheet">
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}
