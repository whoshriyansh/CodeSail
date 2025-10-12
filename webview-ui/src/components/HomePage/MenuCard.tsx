import React from "react";
import { Card, CardDescription, CardTitle } from "../ui/card/Card";
import { lucideIcons, type MenuItem } from "../../types/Homepage";

interface MenuCardProps {
  menu: MenuItem;
  onClick?: () => void;
  selectedMenu?: number | null; // Add selectedMenu prop to determine active state
}

const MenuCard: React.FC<MenuCardProps> = ({ menu, onClick, selectedMenu }) => {
  const IconComponent = lucideIcons[menu.icon];
  const isSelected = selectedMenu === menu.id;
  return (
    <Card
      // className={
      //   isSelected
      //     ? "bg-[var(--vscode-focus-border)]"
      //     : "bg-[var(--vscode-focus-border)]"
      // }
      onClick={onClick}
    >
      <CardTitle>
        <IconComponent
          size={16}
          className="icon"
          color={isSelected ? "var(--vscode-terminal-ansiGreen)" : "#fff"}
        />
        {menu.title}
      </CardTitle>
      <CardDescription>{menu.description}</CardDescription>
    </Card>
  );
};

export default MenuCard;
