import { type FunctionComponent } from "react";
import { Cross } from "lucide-react";
import { twMerge } from "tailwind-merge";
import Button from "../ui/button/Button";

interface AnalysisBoxProps {
  analysisResponse: string[];
  onClear: () => void;
  className?: string;
}

const AnalysisBox: FunctionComponent<AnalysisBoxProps> = ({
  analysisResponse,
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
      <pre className="text-sm whitespace-pre-wrap">
        {analysisResponse.join("\n")}
      </pre>
    </div>
  );
};

export default AnalysisBox;
