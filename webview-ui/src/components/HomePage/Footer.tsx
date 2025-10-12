import { type FunctionComponent } from "react";
import { User, RefreshCw } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { FormButton } from "../ui/formFields/FormFields";

interface FooterProps {
  userStatus: string;
  onRefresh: () => void;
  className?: string;
}

const Footer: FunctionComponent<FooterProps> = ({
  userStatus,
  onRefresh,
  className,
}) => {
  return (
    <footer
      className={twMerge(
        "flex items-center justify-between rounded-md text-sm font-medium shadow-md mt-4 px-4 py-2",
        className
      )}
      style={{
        backgroundColor: "var(--vscode-button-background)",
        color: "var(--vscode-input-foreground)",
      }}
    >
      <div className="flex items-center gap-2">
        <User size={10} />
        {userStatus}
      </div>
      <FormButton onClick={onRefresh}>
        <RefreshCw size={10} />
      </FormButton>
    </footer>
  );
};

export default Footer;
