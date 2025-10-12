import { type FunctionComponent } from "react";
import { type FilePath } from "../../types/Homepage";

import { twMerge } from "tailwind-merge";
import Modal from "../ui/modal/Modal";
import { ListFiles } from "./ListFiles";

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: FilePath[];
  onSelectFile: (file: FilePath) => void;
  className?: string;
}

const FileModal: FunctionComponent<FileModalProps> = ({
  isOpen,
  onClose,
  files,
  onSelectFile,
  className,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={twMerge(
        "left-5 bottom-28 max-h-[30vh] w-3/4 md:w-2/4 flex flex-col gap-2 z-40",
        className
      )}
    >
      <ul className="space-y-2">
        {files.length > 0 ? (
          files.map((file, index) => (
            <ListFiles
              key={index}
              file={file}
              index={index}
              handleSelectFile={onSelectFile}
            />
          ))
        ) : (
          <li>No files found.</li>
        )}
      </ul>
    </Modal>
  );
};

export default FileModal;
