import { type FunctionComponent } from "react";
import { User, LogOut, ExternalLink } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { FormButton } from "../ui/formFields/FormFields";
import Button from "../ui/button/Button";
import Modal from "../ui/modal/Modal";

interface Profile {
  avatar_url: string;
  email: string;
  username: string;
  accessToken?: string;
}

interface FooterProps {
  isOpen: boolean;
  onClose: () => void;
  userStatus: string;
  className?: string;
  profile?: Profile | null;
  onSignIn: () => void;
  isLoading: boolean;
}

const Footer: FunctionComponent<FooterProps> = ({
  userStatus,
  className,
  isOpen,
  onClose,
  profile,
  onSignIn,
  isLoading,
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
        <Button onClick={onClose}>
          <User size={16} />
        </Button>
        <span>{userStatus}</span>
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          className={twMerge(
            "left-5 bottom-28 max-h-[30vh] w-3/4 md:w-2/4 flex flex-col gap-2 z-40",
            className
          )}
        >
          <div className="flex flex-col items-start gap-4">
            {profile ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <img
                    src={profile.avatar_url}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <h1 className="font-bold">{profile.username}</h1>
                    <p className="text-sm text-gray-500">
                      {profile.email || "No email provided"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <FormButton
                    className="flex items-center justify-center gap-2"
                    onClick={() =>
                      window.open(
                        "https://github.com/settings/profile",
                        "_blank"
                      )
                    }
                  >
                    Manage Account
                    <ExternalLink size={16} />
                  </FormButton>
                  <FormButton
                    className="flex items-center justify-center gap-2"
                    onClick={() => console.log("Nothing")}
                    disabled={isLoading}
                  >
                    Sign Out
                    <LogOut size={16} />
                  </FormButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p>Not signed in</p>
                <FormButton
                  className="flex items-center justify-center gap-2"
                  onClick={onSignIn}
                  disabled={isLoading}
                >
                  Sign In with GitHub
                  <ExternalLink size={16} />
                </FormButton>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </footer>
  );
};

export default Footer;
