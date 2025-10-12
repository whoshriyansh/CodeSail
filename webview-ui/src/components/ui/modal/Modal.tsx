import { X } from "lucide-react";
import { type FunctionComponent, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

const Modal: FunctionComponent<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={twMerge(
        "absolute z-50 bg-[var(--vscode-background)] border-[0.3px] border-solid border-[var(--vscode-input-background)] rounded-t-md p-5 shadow-lg overflow-y-hidden",
        className
      )}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-[var(--vscode-button-foreground)] hover:text-[var(--vscode-button-hoverBackground)] rounded-md p-2 mb-5"
        aria-label="Close modal"
      >
        <X size={14} />
      </button>

      <div className="overflow-y-auto mt-6">{children}</div>
    </div>
  );
};

export default Modal;
