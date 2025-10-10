import * as vscode from "vscode";
import * as path from "path";
import { listAllWorkspaceFiles, readFileContent } from "../extension";
import { getIconForExtension } from "../utils/getIconForExtension";
import { streamDeepSeekAnalysis } from "../api/CodeAnalysis/CodeAnalysis";

export class ViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = "codesailView";

  private _webview?: vscode.Webview;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._webview = webviewView.webview;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "fetchdata":
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
          break;
        case "Analyse File": {
          try {
            if (
              !message.data?.filePath ||
              !message.data?.prompt ||
              !message.data?.fileName
            ) {
              webviewView.webview.postMessage({
                command: "error",
                text: "Missing file or prompt for analysis.",
              });
              return;
            }

            webviewView.webview.postMessage({ command: "analysisStart" });
            const code = await readFileContent(message.data.filePath);
            // console.log("readFileContent result:", {
            //   filePath: message.data.filePath,
            //   codeLength: code?.length || 0,
            //   codeSnippet: code
            //     ? code.slice(0, 100) + (code.length > 100 ? "..." : "")
            //     : "null or empty",
            // });

            if (!code) {
              vscode.window.showInformationMessage(`No File Found`);
              return; // Explicitly return to stop execution
            }

            await streamDeepSeekAnalysis(
              code,
              message.data.prompt,
              (chunk) => {
                webviewView.webview.postMessage({
                  command: "analysisChunk",
                  data: {
                    ...chunk,
                    prompt: message.data.prompt,
                  },
                });
              },
              (error) => {
                if (error) {
                  console.error("StreamDeepSeekAnalysis error:", error);
                  webviewView.webview.postMessage({
                    command: "error",
                    text: error,
                  });
                } else {
                  console.log("Analysis completed successfully");
                  webviewView.webview.postMessage({
                    command: "analysisComplete",
                  });
                }
              }
            );
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error("Analysis error:", msg, error);
            webviewView.webview.postMessage({
              command: "error",
              text: `Analysis error: ${msg}`,
            });
          }
          break;
        }
        default: {
          webviewView.webview.postMessage({
            command: "error",
            text: `Unknown command: ${message.command}`,
          });
          break;
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
    const cspSource = `default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource};`;
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
