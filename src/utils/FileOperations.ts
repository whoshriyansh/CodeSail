// src/utils/FileOperations.ts
import * as vscode from "vscode";
import { listAllWorkspaceFiles, readFileContent } from "../extension";
import { getIconForExtension } from "../utils/getIconForExtension";

export interface FileData {
  path: string;
  name: string;
  extension: string;
  icon: string;
}

export async function getWorkspaceFiles(): Promise<FileData[]> {
  try {
    const files = await listAllWorkspaceFiles();
    return (
      files?.map((file) => {
        const path = file.fsPath;
        const name = path.split(/[/\\]/).pop() || "";
        const extension = name.split(".").pop()?.toLowerCase() || "";
        return {
          path,
          name,
          extension,
          icon: getIconForExtension(extension),
        };
      }) ?? []
    );
  } catch (error) {
    throw new Error(`Failed to fetch files: ${String(error)}`);
  }
}

export async function readFile(filePath: string): Promise<string | null> {
  try {
    const content = await readFileContent(filePath);
    if (!content) {
      vscode.window.showInformationMessage(`No File Found`);
      return null;
    }
    return content;
  } catch (error) {
    throw new Error(`Failed to read file: ${String(error)}`);
  }
}
