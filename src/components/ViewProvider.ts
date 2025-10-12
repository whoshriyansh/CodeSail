import * as vscode from "vscode";
import * as path from "path";
import { listAllWorkspaceFiles, readFileContent } from "../extension";
import { getIconForExtension } from "../utils/getIconForExtension";
import { streamDeepSeekAnalysis } from "../api/CodeAnalysis/CodeAnalysis";
import axios from "axios";

export class ViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = "codesailView";

  private _webview?: vscode.Webview;
  private readonly _context: vscode.ExtensionContext; // Add context

  constructor(
    private readonly _extensionUri: vscode.Uri,
    context: vscode.ExtensionContext // Add context parameter
  ) {
    this._context = context; // Store context
  }

  public async sendAuthRequest() {
    if (this._webview) {
      this._webview.postMessage({ command: "Github Authentication" });
    }
  }

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
            webviewView.webview.postMessage({
              command: "error",
              text: `Failed to fetch files: ${String(error)}`,
            });
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

            if (!code) {
              vscode.window.showInformationMessage(`No File Found`);
              return;
            }

            const apiKey = await this._context.secrets.get("grokApiKey"); // Get key
            if (!apiKey) {
              webviewView.webview.postMessage({
                command: "error",
                text: "Grok API key not configured. Please submit your key.",
              });
              return;
            }

            await streamDeepSeekAnalysis(
              code,
              message.data.prompt,
              apiKey, // Pass key
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
        case "Github Authentication":
          try {
            const session = await vscode.authentication.getSession(
              "github",
              ["user:email"],
              { createIfNone: true }
            );
            if (!session) {
              vscode.window.showErrorMessage("GitHub authentication failed.");
              webviewView.webview.postMessage({
                command: "error",
                text: "GitHub authentication failed.",
              });
              return;
            }

            const { data } = await axios.get("https://api.github.com/user", {
              headers: {
                Authorization: `token ${session.accessToken}`,
                Accept: "application/vnd.github.v3+json",
              },
            });

            const userDataForBackend = {
              githubId: data.id,
              username: data.login,
              email: data.email || `${data.login}@github.com`,
              avatarUrl: data.avatar_url,
              accessToken: session.accessToken,
            };

            await axios.post(
              "http://localhost:8001/api/auth/register",
              userDataForBackend
            );

            webviewView.webview.postMessage({
              command: "userProfile",
              data: {
                avatar_url: data.avatar_url,
                email: data.email || `${data.login}@github.com`,
                username: data.login,
                accessToken: session.accessToken,
              },
            });

            vscode.window.showInformationMessage(
              "Successfully authenticated with GitHub!"
            );
          } catch (error: any) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error("Authentication error:", msg, error);
            webviewView.webview.postMessage({
              command: "error",
              text: `Error during authentication: ${msg}`,
            });
          }
          break;
        case "Submit Grok Key":
          try {
            const input = await vscode.window.showInputBox({
              prompt: "Enter your Grok API key (from console.x.ai)",
              password: true,
              ignoreFocusOut: true,
            });
            if (input) {
              await this._context.secrets.store("grokApiKey", input);
              webviewView.webview.postMessage({
                command: "keySaved",
                text: "Grok API key saved successfully!",
              });
            } else {
              webviewView.webview.postMessage({
                command: "error",
                text: "No API key provided.",
              });
            }
          } catch (error: any) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error("Key submission error:", msg, error);
            webviewView.webview.postMessage({
              command: "error",
              text: `Failed to save API key: ${msg}`,
            });
          }
          break;
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
        "dist",
        "assets",
        "index.js"
      )
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "webview-ui",
        "dist",
        "assets",
        "index.css"
      )
    );
    const cspSource = `default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; connect-src http://localhost:8001;`;
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
