import * as vscode from "vscode";
import * as path from "path";
import { listAllWorkspaceFiles } from "../extension";
import { getIconForExtension } from "../utils/getIconForExtension";

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
          const files = await listAllWorkspaceFiles();

          if (files) {
            const filedata = files.map((file) => {
              const path = file.fsPath;
              const name = path.split(/[/\\]/).pop() || "";
              const extension = name.split(".").pop()?.toLowerCase() || "";

              return {
                path,
                name,
                extension,
                icon: getIconForExtension(extension),
              };
            });

            webviewView.webview.postMessage({
              command: "all-files",
              data: filedata,
            });
          }
        } catch (error) {
          console.error("Fetch error:", error);
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    //Here we are joining path for the index.js file of our react application
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "webview-ui",
        "build",
        "assets",
        "index.js"
      )
    );

    //Here we are Joining path for our css file which is in accoridng to vs code styling
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "webview-ui",
        "build",
        "assets",
        "index.css"
      )
    );

    //Here we are creating a html file as it should be the root to render in a web view pannel so we are giving our js file and style file
    //Remember only 1 html file get's deployed in 1 web view.
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
