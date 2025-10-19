import { type FunctionComponent, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: FunctionComponent<CardProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        "p-4 bg-[var(--vscode-input-background)] flex flex-col gap-3 rounded-xl shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

const CardHeader: FunctionComponent<CardProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        "p-2 border border-solid rounded-md bg-transparent shadow-md hover:shadow-lg transition-shadow duration-200 grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 [.border-b]:pb-6",
        className
      )}
    >
      {children}
    </div>
  );
};
const CardTitle: FunctionComponent<CardProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        "leading-none font-semibold rounded-md text-[var(--vscode-foreground)] ",
        className
      )}
    >
      {children}
    </div>
  );
};

const CardDescription: FunctionComponent<CardProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        "rounded-md text-[var(--vscode-descriptionForeground)] text-muted-foreground text-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

const CardAction: FunctionComponent<CardProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
    >
      {children}
    </div>
  );
};

const CardContent: FunctionComponent<CardProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <div onClick={onClick} className={twMerge("px-6", className)}>
      {children}
    </div>
  );
};

const CardFooter: FunctionComponent<CardProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        "flex items-center px-6 [.border-t]:pt-6 rounded-md bg-[var(--vscode-editor-background)]",
        className
      )}
    >
      {children}
    </div>
  );
};

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
