import { type FunctionComponent, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const Button: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  className,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        "flex items-center gap-2 px-4 py-2 ",
        className,
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
};

export default Button;
