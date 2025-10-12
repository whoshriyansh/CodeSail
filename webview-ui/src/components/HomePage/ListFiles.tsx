import { type FunctionComponent } from "react";
import type { FilePath } from "../../types/Homepage";

// Define the props interface for ListFiles
interface ListFilesProps {
  file: FilePath;
  index: number;
  handleSelectFile: (file: FilePath) => void;
}

// Define the component as a FunctionComponent with the props interface
export const ListFiles: FunctionComponent<ListFilesProps> = ({
  file,
  index,
  handleSelectFile,
}) => {
  return (
    <div
      key={index}
      className="flex justify-between items-center gap-2 cursor-pointer"
      onClick={() => handleSelectFile(file)}
    >
      <div className="flex items-center gap-2">
        <p className="font-medium">{file.name}</p>
      </div>
      <p className="text-xs truncate max-w-[60%]">{file.path}</p>
    </div>
  );
};
