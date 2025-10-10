import Groq from "groq-sdk";

export async function streamDeepSeekAnalysis(
  code: string,
  prompt: string,
  onChunk: (chunk: { type: "thinking" | "final"; content: string }) => void,
  onComplete: (error?: string) => void
): Promise<void> {
  const groq = new Groq({
    apiKey: "",
  });

  const SYSTEM_PROMPT = `
You are DeepSeek, an expert code analyst, debugger, and optimizer. Your task is to analyze the provided code for bugs, issues (logical, performance, security, style), and suggest fixes based on the user's task.

Rules for Response Structure:
1. Start with step-by-step thinking: Output exactly 4-6 concise steps, each prefixed with [STEP n]: (e.g., [STEP 1]: Identify main components and potential entry points.).
2. Keep steps brief (1-2 sentences each) and focused on reasoning walkthrough.
3. After all steps, end thinking with [FINAL].
4. In [FINAL], provide structured markdown output ONLY:
   - **Analysis Walkthrough**: Detailed step-by-step explanation of code execution, logic flow, and identified issues.
   - **Issues Found**: Numbered list of bugs/problems with severity (Low/Medium/High), explanation, and code snippet references.
   - **Suggestions**: Bullet list of improvements, optimizations, and best practices.
   - **Fixed Code**: Full corrected code in a fenced code block (e.g., \`\`\`js\nfixed code\n\`\`\`).
   - **Changes Summary**: Diff-like summary (e.g., - Removed unused var; + Added error handling).
5. Ensure output is parsable: Steps are line-separated; [FINAL] section uses markdown headings/lists/code blocks.
6. Be objective, precise, and constructive. Assume best intent in code. If no issues, praise and suggest minor enhancements.
7. Output NOTHING else—no introductions, conclusions, or extra text.
`;

  const USER_PROMPT = `Code to analyze:\n\`\`\`\n${code}\n\`\`\`\n\nUser task: ${prompt}\n\nFollow the rules exactly.`;

  if (!code.trim() || !prompt.trim()) {
    onComplete("Error: Code or prompt is empty");
    return;
  }

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Start with this—fast & code-capable
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_PROMPT },
      ],
      stream: true,
      temperature: 0.1,
      max_tokens: 4096,
    });

    let buffer = "";
    let isThinking = true;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) {
        buffer += delta;
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) {
            if (trimmed.includes("[FINAL]")) {
              isThinking = false;
              onChunk({ type: "thinking", content: trimmed });
            } else {
              onChunk({
                type: isThinking ? "thinking" : "final",
                content: trimmed,
              });
            }
          }
        }
      }
    }
    console.log("Groq API stream completed");
    onComplete();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Groq API error:", message, error);
    onComplete(`Groq API error: ${message}`);
  }
}
