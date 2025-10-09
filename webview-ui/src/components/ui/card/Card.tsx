import React from "react";
import "../../../index.css";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardHeading: React.FC<CardHeadingProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`flex items-center gap-1 font-medium ${className}`}
      style={{ color: "var(--vscode-foreground)" }}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <p
      className={`font-normal text-sm mt-2 ${className}`}
      style={{ color: "var(--vscode-descriptionForeground)" }}
      {...props}
    >
      {children}
    </p>
  );
};
