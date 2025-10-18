import { type FunctionComponent } from "react";
import { User, LogOut } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { FormButton } from "../ui/formFields/FormFields";

export interface Profile {
  avatar_url: string;
  email: string;
  username: string;
  accessToken?: string;
}

interface FooterProps {
  className?: string;
  profile?: Profile | null;
  onSignIn: () => void;
}

const Footer: FunctionComponent<FooterProps> = ({
  className,
  profile,
  onSignIn,
}) => {
  console.log("This is the User Profile in footer", profile);
  return (
    <footer
      className={twMerge(
        "flex items-center justify-between rounded-md text-sm font-medium shadow-md mt-4 px-2 py-2",
        className
      )}
      style={{
        color: "var(--vscode-input-foreground)",
      }}
    >
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center justify-center gap-2">
          <FormButton onClick={onSignIn}>
            {profile ? (
              <div className="flex items-center gap-2">
                <img
                  alt="User Avatar"
                  className="w-6 h-6 rounded-full"
                  src={profile.avatar_url}
                />
                <div className="text-var(--vscode-input-foreground)">
                  @{profile.username}
                </div>
              </div>
            ) : (
              <User size={16} />
            )}
          </FormButton>
        </div>

        {profile && (
          <div>
            <FormButton
              className="flex items-center justify-center gap-2"
              onClick={() => console.log("Nothing")}
            >
              Sign Out
              <LogOut size={16} />
            </FormButton>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
