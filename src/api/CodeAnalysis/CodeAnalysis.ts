import * as vscode from "vscode";
import ollama from "ollama";

export async function streamDeepSeekAnalysis(
  code: string,
  prompt: string,
  webview: vscode.Webview
) {
  const SYSTEM_PROMPT = `You are an expert code reviewer. Analyze the provided code within a 30-second limit, strictly adhering to these rules:
1. Share 1 brief thought during analysis (e.g., "Checking for errors...").
2. If the code is unstructured, provide a concise, commented, corrected version.
3. If the code is correct, state so and ask if the user needs specific help.
4. For type, variable, or function errors, provide a short corrected code snippet with a brief explanation.
5. Avoid assumptions about unrelated frameworks or tools unless explicitly mentioned.
6. Keep responses under 200 words, focusing only on the issue and solution.
7. Conclude with one relevant question about the user's code or task.`;
  const USER_PROMPT = `Code to analyze:\n\`\`\`\n${code}\n\`\`\`\n\nUser task: ${prompt}\n\nFollow the rules exactly.`;

  try {
    const stream = await ollama.chat({
      model: "deepseek-r1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_PROMPT },
      ],
      stream: true,
    });

    let finalContent = "";
    let inThinking = false;

    for await (const chunk of stream) {
      try {
        if (chunk.message.thinking) {
          if (!inThinking) {
            inThinking = true;
            webview.postMessage({
              command: "thinkingStart",
              text: "Starting analysis...",
            });
          }
          webview.postMessage({
            command: "thinking",
            text: chunk.message.thinking,
          });
        } else if (chunk.message.content) {
          if (inThinking) {
            inThinking = false;
            webview.postMessage({
              command: "streamStart",
              text: "Receiving analysis...",
            });
          }
          webview.postMessage({
            command: "stream",
            text: chunk.message.content,
          });
          finalContent += chunk.message.content;
        }
      } catch (webviewError) {
        console.error("Webview postMessage error:", webviewError);
      }
    }

    webview.postMessage({ command: "final", text: finalContent });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Ollama API error:", message, error);
    webview.postMessage({
      command: "error",
      text: `Analysis failed: ${message}`,
    });
    throw new Error(message);
  }
}
