import ollama from "ollama";

export async function streamDeepSeekAnalysis(code: string, prompt: string) {
  const SYSTEM_PROMPT = `You are an expert software engineer integrated into a VS Code extension for code analysis and generation.

Your role is to assist users by analyzing a provided code file, performing tasks such as bug fixing, code analysis, or implementing new features, and returning structured, actionable results. Follow these guidelines:
- Analyze the provided codebase and user task carefully.
- Break down your reasoning into 3–5 numbered, named thinking steps, each with a concise description (50–100 words).
- Focus on practical, straightforward solutions. Avoid overly complex or theoretical reasoning.
- Detect the programming language from the file extension (e.g., '.js' for JavaScript, '.py' for Python) or code content if the extension is ambiguous.
- For new or modified files, provide the full file content as a JSON string with proper escaping (e.g., newlines as \\n, quotes as \\", etc.). Do NOT wrap file content in Markdown code blocks (e.g., \`\`\`javascript ... \`\`\`).
- For deleted files, provide only the file path.
- If the user’s prompt is vague (e.g., "fix my code"), infer the intent based on the codebase or return a clarification request in the response.
- Ensure all code follows best practices for the detected language and integrates seamlessly with the existing codebase.
- Return the response as a valid JSON object, strictly adhering to the specified format. Do NOT wrap the JSON in Markdown code blocks or include any non-JSON content.

# Response Format - Strictly Follow This Structure
{
  "task_name": "Summarized task name (max 50 characters)",
  "thinking_steps": [
    {
      "step_number": 1,
      "step_title": "Step title (max 50 characters)",
      "step_description": "Description in markdown (50–100 words)"
    }
  ],
  "pr_title": "PR title (max 100 characters)",
  "pr_description": "PR description in markdown (max 500 characters)",
  "file_changes": [
    {
      "file_status": "new | modified | deleted",
      "file_path": "path/from/root/file.ext",
      "file_content": "Complete file content as a JSON string with proper escaping, only for 'new' or 'modified' files"
    }
  ]
}

# Clarification Handling
If the task is unclear, include a top-level "clarification" field in the JSON response with a message and suggested questions (e.g., {"clarification": {"message": "Please specify the issue", "questions": ["What specific bug are you facing?"]}}).

Now, based on the provided codebase and task, generate the implementation in the specified JSON format. Ensure all file content is properly escaped as a JSON string and avoid any Markdown code blocks.`;

  const USER_PROMPT = `
# Existing Codebase
<codebase>
${code}
</codebase>

# Task
<task_details>
${
  prompt ||
  "No details provided. Analyze the code for common issues or suggest improvements."
}
</task_details>

Generate the implementation in the specified JSON format.`;

  try {
    const response = await ollama.chat({
      model: "qwen2.5-coder",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_PROMPT },
      ],
      stream: false,
    });

    const content = response.message.content;

    // Attempt to parse the content as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      // If parsing fails, attempt to clean up potential Markdown code blocks
      const cleanedContent = content
        .replace(/```json\n([\s\S]*?)\n```/, "$1") // Remove outer ```json ... ``` if present
        .replace(/```[a-zA-Z]*\n([\s\S]*?)\n```/g, (match, p1) =>
          JSON.stringify(p1)
        ) // Replace inner code blocks with escaped strings
        .trim();

      try {
        parsedResponse = JSON.parse(cleanedContent);
      } catch (cleanedParseError) {
        console.error("Failed to parse cleaned content:", cleanedContent);
        console.error("Parse error details:", cleanedParseError);
        throw new Error(
          `Invalid JSON format in response: ${
            cleanedParseError instanceof Error
              ? cleanedParseError.message
              : String(cleanedParseError)
          }`
        );
      }
    }

    // Validate the parsed response structure
    if (
      !parsedResponse.task_name ||
      !Array.isArray(parsedResponse.thinking_steps) ||
      !parsedResponse.pr_title ||
      !parsedResponse.pr_description ||
      !Array.isArray(parsedResponse.file_changes)
    ) {
      console.error("Parsed response missing required fields:", parsedResponse);
      throw new Error("Parsed response is missing required fields");
    }

    // Ensure file_content is properly escaped
    parsedResponse.file_changes = parsedResponse.file_changes.map(
      (change: any) => {
        if (change.file_content && typeof change.file_content === "string") {
          try {
            // Attempt to parse file_content to ensure it's valid
            JSON.parse(JSON.stringify(change.file_content));
          } catch (e) {
            // Escape the file_content properly
            change.file_content = JSON.stringify(change.file_content)[1].slice(
              0,
              -1
            );
          }
        }
        return change;
      }
    );

    return parsedResponse;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Ollama API error:", message, error);
    throw new Error(`Analysis failed: ${message}`);
  }
}
