import * as vscode from "vscode";
import * as fs from "fs/promises";
import { ViewProvider } from "./components/ViewProvider";
import { Groq } from "groq-sdk";
import axios, { AxiosError } from "axios";

export async function listAllWorkspaceFiles() {
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
      return [];
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`Error listing files: ${error.message}`);
    return [];
  }
}

export async function readFileContent(filePath: string) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    vscode.window.showInformationMessage(`File content read successfully`);
    return content;
  } catch (error: any) {
    const errorMsg = `Error reading file: ${error.message}`;
    vscode.window.showErrorMessage(errorMsg);
    throw new Error(errorMsg);
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "codesail" is now active!');

  const provider = new ViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ViewProvider.viewId, provider)
  );

  // Register the correct command
  context.subscriptions.push(
    vscode.commands.registerCommand("codesail.authenticate", async () => {
      try {
        const session = await vscode.authentication.getSession(
          "github",
          ["user"],
          {
            createIfNone: true,
          }
        );
        if (!session) {
          console.log("GitHub session not available.");
          vscode.window.showErrorMessage("GitHub authentication failed.");
          return;
        }

        console.log("GitHub Access Token:", session.accessToken);
        const { data } = await axios.get("https://api.github.com/user", {
          headers: {
            Authorization: `token ${session.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        console.log("GitHub User Data:", data);

        const userDataForBackend = {
          githubId: data.id,
          username: data.login,
          email: data.email,
          avatarUrl: data.avatar_url,
          accessToken: session.accessToken,
        };
        await axios.post(
          "http://localhost:8001/api/auth/register",
          userDataForBackend
        );
        vscode.window.showInformationMessage(
          "Successfully authenticated with GitHub!"
        );
      } catch (error: any) {
        const message = getErrorMessage(error);
        console.error("Authentication error:", message, error);
        vscode.window.showErrorMessage(
          `Error during authentication: ${message}`
        );
      }
    })
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.error || error.message || "Unknown Axios error"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function deactivate() {}
