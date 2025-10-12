import { type FunctionComponent } from "react";
import { twMerge } from "tailwind-merge";
import { CardDescription, CardTitle } from "../ui/card/Card";

interface HeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

const Header: FunctionComponent<HeaderProps> = ({
  title,
  subtitle,
  className,
}) => {
  return (
    <div className={twMerge("text-center mb-4", className)}>
      <CardTitle className="text-2xl font-semibold mb-1">{title}</CardTitle>
      <CardDescription className="text-sm">{subtitle}</CardDescription>
    </div>
  );
};

export default Header;
