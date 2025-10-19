import React, { type FunctionComponent } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  onClick?: () => void;
}

const Input: FunctionComponent<InputProps> = ({
  value,
  onChange,
  placeholder,
  readOnly,
  className,
  onClick,
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      onClick={onClick}
      className={twMerge(
        "w-full p-2 text-[var(--vscode-input-foreground)] rounded-md shadow-md focus:outline-none text-sm",
        className
      )}
    />
  );
};
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  children,
  className = "",
  ...props
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`border border-solid px-2 py-1 rounded-md ${className}`}
      style={{
        backgroundColor: "var(--vscode-input-background)",
        color: "var(--vscode-input-foreground)",
        borderColor: "var(--vscode-input-border)",
      }}
      {...props}
    >
      {children}
    </select>
  );
};

interface FormButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const FormButton: React.FC<FormButtonProps> = ({
  children,
  onClick,
  className = "",
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={`text-sm border border-solid px-1 py-0.5 rounded-md cursor-pointer hover:scale-105 transition-all duration-300 ${className}`}
      style={{
        backgroundColor: "var(--vscode-button-background)",
        color: "var(--vscode-button-foreground)",
        borderColor: "var(--vscode-button-border)",
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export { Input, Select, FormButton };
