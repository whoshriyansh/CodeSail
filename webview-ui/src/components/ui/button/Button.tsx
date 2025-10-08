import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
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

export default Button;
