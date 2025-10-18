import { type FunctionComponent } from "react";
import { Cross } from "lucide-react";
import { twMerge } from "tailwind-merge";
import Button from "../ui/button/Button";

interface AnalysisBoxProps {
  thinking: string;
  streamedResponse: string;
  finalAnswer: string;
  error: string;
  onClear: () => void;
  className?: string;
}

const AnalysisBox: FunctionComponent<AnalysisBoxProps> = ({
  thinking,
  streamedResponse,
  finalAnswer,
  error,
  onClear,
  className,
}) => {
  return (
    <div
      className={twMerge(
        "flex flex-col gap-2 p-4 border border-solid rounded-md bg-[var(--vscode-editor-background)] max-h-[60vh] overflow-y-auto mb-4 shadow-md",
        className
      )}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Code Analysis</h2>
        <Button onClick={onClear}>
          <Cross size={14} /> Clear
        </Button>
      </div>
      {thinking && (
        <pre className="text-sm whitespace-pre-wrap text-gray-500 italic">
          {thinking}
        </pre>
      )}
      {streamedResponse && (
        <pre className="text-sm whitespace-pre-wrap">{streamedResponse}</pre>
      )}
      {finalAnswer && (
        <div className="p-4 bg-green-100 border border-green-300 rounded-md">
          <h3 className="text-md font-semibold text-green-800">Final Answer</h3>
          <pre className="text-sm whitespace-pre-wrap">{finalAnswer}</pre>
        </div>
      )}
      {error && (
        <pre className="text-sm whitespace-pre-wrap text-red-500">
          Error: {error}
        </pre>
      )}
    </div>
  );
};

export default AnalysisBox;
