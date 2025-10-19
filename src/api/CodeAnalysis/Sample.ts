import ollama from "ollama";

export async function streamDeepSeekAnalysis() {
  const SYSTEM_PROMPT = `You are an expert software engineer integrated into a VS Code extension for code analysis and generation. THINK STEP BY STEP

Your role is to assist users by analyzing a provided code file, performing tasks such as bug fixing, code analysis, or implementing new features, and returning structured, actionable results. Follow these guidelines:
- Analyze the provided codebase and user task carefully.
- Break down your reasoning into 3–5 numbered, named thinking steps, each with a concise description (50–100 words).
- Focus on practical, straightforward solutions. Avoid overly complex or theoretical reasoning.
- Detect the programming language from the file extension (e.g., '.js' for JavaScript, '.py' for Python) or code content if the extension is ambiguous.
- For new or modified files, provide the full file content with proper imports, function definitions, and exports, wrapped in language-specific code blocks (e.g., \`\`\`javascript ... \`\`\`).
- For deleted files, provide only the file path.
- If the user’s prompt is vague (e.g., "fix my code"), infer the intent based on the codebase or return a clarification request in the response.
- Ensure all code follows best practices for the detected language and integrates seamlessly with the existing codebase.
- Return the response as a JSON object for easy parsing, with markdown for non-code text (e.g., descriptions, thinking steps).`;

  const USER_PROMPT = `
# Existing Codebase
<codebase>
"import * as vscode from "vscode";
import * as fs from "fs/promises";
import { createViewProvider } from "./webview/ViewProvider";

export async function listAllWorkspaceFiles() {
  const excludePatterns = "**/{node_modules,dist,build,.git,.*}/**";
  try {
	const allFiles = await vscode.workspace.findFiles("**/*", excludePatterns);
	if (allFiles.length > 0) {
	  vscode.window.showInformationMessage(

	  );
	  return allFiles;
	} else {
	  vscode.window.showInformationMessage(
		"No important files found in the workspace."
	  );
	  return [];
	}
  } catch (error: any) {
	vscode.window.showErrorMessage("Error listing files"");
	return [];
  }
}

export async function readFileContent(filePath: string) {
  try {
	const content = await fs.readFile(filePath, "utf8");
	vscode.window.showInformationMessage("File content read successfully");
	return content;
  } catch (error: any) {
	const errorMsg = "Error reading file";
	vscode.window.showErrorMessage(errorMsg);
	throw new Error(errorMsg);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const provider = createViewProvider(context.extensionUri, context);
  context.subscriptions.push(
	vscode.window.registerWebviewViewProvider(provider.viewId, provider)
  );
}

export function deactivate() {}"
</codebase>

# Task
<task_details>
Analyse the code and give improvements
</task_details>

# Response Instructions
Respond with a JSON object containing:
- **task_name**: A summarized name for the task (max 50 characters).
- **thinking_steps**: An array of objects, each with:
  - **step_number**: The step number (1, 2, 3, etc.).
  - **step_title**: A brief title for the step (max 50 characters).
  - **step_description**: A concise description of the reasoning (50–100 words, in markdown).
- **pr_title**: The title of the pull request (max 100 characters).
- **pr_description**: A description of the changes (max 500 characters, in markdown).
- **file_changes**: An array of objects, each with:
  - **file_status**: 'new', 'modified', or 'deleted'.
  - **file_path**: The full path from the project root, including the file extension.
  - **file_content**: The complete file content for 'new' or 'modified' files, wrapped in a language-specific code block (e.g., \`\`\`javascript ... \`\`\`). Omit for 'deleted' files.

# Response Format
\`\`\`json
{
  "task_name": "Summarized task name",
  "thinking_steps": [
    {
      "step_number": 1,
      "step_title": "Step title",
      "step_description": "Description in markdown"
    },
    ...
  ],
  "pr_title": "PR title",
  "pr_description": "PR description in markdown",
  "file_changes": [
    {
      "file_status": "new | modified | deleted",
      "file_path": "path/from/root/file.ext",
      "file_content": "\`\`\`language\nfile content\n\`\`\`"
    },
    ...
  ]
}
\`\`\`

# Clarification Handling
If the task is unclear, include a top-level **clarification** field in the JSON response with a message and suggested questions (e.g., {"clarification": {"message": "Please specify the issue", "questions": ["What specific bug are you facing?"]}}).

Now, based on the provided codebase and task, generate the implementation in the specified JSON format.`;

  const stream = await ollama.chat({
    model: "qwen2.5-coder",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: USER_PROMPT },
    ],
    stream: false,
  });
}

streamDeepSeekAnalysis();
