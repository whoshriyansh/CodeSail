import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  className = "",
  ...props
}) => {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`flex-1 bg-transparent border-none outline-none ${className}`}
      style={{
        color: "var(--vscode-input-foreground)",
      }}
      {...props}
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
      className={`border border-solid px-1 py-0.5 rounded-md cursor-pointer hover:scale-105 transition-all duration-300 ${className}`}
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
