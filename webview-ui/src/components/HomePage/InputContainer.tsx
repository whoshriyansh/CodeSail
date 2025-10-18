import React, { type FunctionComponent } from "react";
import { Plus } from "lucide-react";

import { type FilePath } from "../../types/Homepage";
import { twMerge } from "tailwind-merge";
import { FormButton, Input } from "../ui/formFields/FormFields";

interface InputContainerProps {
  fileModalOpen: boolean;
  selectedFile: FilePath | null;
  input: string;
  onFileModalToggle: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  className?: string;
  searchTerm: string;
  onSearch: (value: string) => void;
}

const InputContainer: FunctionComponent<InputContainerProps> = ({
  fileModalOpen,
  selectedFile,
  input,
  onFileModalToggle,
  onInputChange,
  onSend,
  className,
  searchTerm,
  onSearch,
}) => {
  return (
    <div
      className={twMerge(
        "flex flex-col gap-2 mt-auto bg-[var(--vscode-input-background)] px-2 py-2 rounded-md items-start",
        className
      )}
    >
      <div>
        {fileModalOpen ? (
          <Input
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search for File"
            className="mb-2"
          />
        ) : selectedFile ? (
          <Input
            value={selectedFile.name}
            onClick={onFileModalToggle}
            readOnly
            className="cursor-pointer"
          />
        ) : (
          <FormButton onClick={onFileModalToggle}>
            <Plus size={16} />
          </FormButton>
        )}
      </div>
      <div className="flex gap-2 items-center w-full">
        <div className="flex-1">
          <Input
            value={input}
            onChange={onInputChange}
            placeholder="Describe task (@mention for context)"
          />
        </div>
        <FormButton onClick={onSend}>Send</FormButton>
      </div>
    </div>
  );
};

export default InputContainer;
