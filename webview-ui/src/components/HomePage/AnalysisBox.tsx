import { useEffect, useRef } from "react";
import { AnalysisResponse, ThinkingStep } from "../../types/Homepage";

interface AnalysisBoxProps {
  thinkingSteps: ThinkingStep[];
  finalAnswer: AnalysisResponse | null;
  error: string;
  onClear: () => void;
  isLoading: boolean;
}

const AnalysisBox = ({
  thinkingSteps,
  finalAnswer,
  error,
  onClear,
  isLoading,
}: AnalysisBoxProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when content updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thinkingSteps, finalAnswer, error, isLoading]);

  // Extract language and content from code block
  const extractCodeContent = (
    content: string
  ): { language: string; code: string } => {
    const match = content.match(/```(\w+)?\n([\s\S]*?)\n```/);
    if (match) {
      return { language: match[1] || "plaintext", code: match[2] };
    }
    return { language: "plaintext", code: content };
  };

  return (
    <div className="flex-1 bg-[var(--vscode-editor-background)] border border-[var(--vscode-panel-border)] rounded-md p-4 mb-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-[var(--vscode-foreground)]">
          Analysis Results
        </h2>
        <button
          onClick={onClear}
          className="px-2 py-1 bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] rounded-md hover:bg-[var(--vscode-button-hoverBackground)] transition"
        >
          Clear
        </button>
      </div>
      <div ref={scrollRef} className="max-h-[50vh] overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <svg
              className="animate-spin h-8 w-8 text-[var(--vscode-foreground)]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
              ></path>
            </svg>
          </div>
        )}
        {error && (
          <div className="text-[var(--vscode-errorForeground)] p-2">
            Error: {error}
          </div>
        )}
        {thinkingSteps.length > 0 && (
          <div className="mb-4">
            <h3 className="text-md font-medium text-[var(--vscode-foreground)] mb-2">
              Thinking Steps
            </h3>
            {thinkingSteps.map((step) => (
              <div
                key={step.step_number}
                className="mb-2 p-3 bg-[var(--vscode-editorHoverWidget-background)] border border-[var(--vscode-editorHoverWidget-border)] rounded-md"
              >
                <div className="font-semibold text-[var(--vscode-foreground)]">
                  {step.step_number}. {step.step_title}
                </div>
                <div className="text-[var(--vscode-descriptionForeground)]">
                  {step.step_description}
                </div>
              </div>
            ))}
          </div>
        )}
        {finalAnswer && (
          <div>
            <h3 className="text-md font-medium text-[var(--vscode-foreground)] mb-2">
              Analysis Summary
            </h3>
            <div className="p-3 bg-[var(--vscode-editorHoverWidget-background)] border border-[var(--vscode-editorHoverWidget-border)] rounded-md mb-4">
              <div className="font-semibold text-[var(--vscode-foreground)]">
                Task: {finalAnswer.task_name}
              </div>
              <div className="text-[var(--vscode-descriptionForeground)]">
                <strong>PR Title:</strong> {finalAnswer.pr_title}
              </div>
              <div className="text-[var(--vscode-descriptionForeground)]">
                <strong>PR Description:</strong> {finalAnswer.pr_description}
              </div>
            </div>
            {finalAnswer.file_changes.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-[var(--vscode-foreground)] mb-2">
                  File Changes
                </h3>
                {finalAnswer.file_changes.map((change, index) => (
                  <div
                    key={index}
                    className="mb-4 p-3 bg-[var(--vscode-editorHoverWidget-background)] border border-[var(--vscode-editorHoverWidget-border)] rounded-md"
                  >
                    <div className="font-semibold text-[var(--vscode-foreground)]">
                      {change.file_status.charAt(0).toUpperCase() +
                        change.file_status.slice(1)}{" "}
                      File: {change.file_path}
                    </div>
                    {change.file_content && (
                      <pre className="mt-2 p-2 bg-[var(--vscode-editor-background)] border border-[var(--vscode-editorLineNumber-foreground)] rounded-md overflow-x-auto">
                        <code className="text-[var(--vscode-editor-foreground)]">
                          {extractCodeContent(change.file_content).code}
                        </code>
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
            {finalAnswer.clarification && (
              <div className="p-3 bg-[var(--vscode-editorHoverWidget-background)] border border-[var(--vscode-editorHoverWidget-border)] rounded-md">
                <div className="font-semibold text-[var(--vscode-errorForeground)]">
                  Clarification Needed
                </div>
                <div className="text-[var(--vscode-descriptionForeground)]">
                  {finalAnswer.clarification.message}
                </div>
                {finalAnswer.clarification.questions.length > 0 && (
                  <ul className="list-disc pl-5 text-[var(--vscode-descriptionForeground)]">
                    {finalAnswer.clarification.questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisBox;
