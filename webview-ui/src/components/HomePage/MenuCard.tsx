import React from "react";
import { Card, CardDescription, CardHeading } from "../ui/card/Card";
import { lucideIcons, type MenuItem } from "../../types/Homepage";

interface MenuCardProps {
  menu: MenuItem;
  onClick?: () => void;
  selectedMenu?: number | null; // Add selectedMenu prop to determine active state
}

const MenuCard: React.FC<MenuCardProps> = ({ menu, onClick, selectedMenu }) => {
  const IconComponent = lucideIcons[menu.icon];
  const isSelected = selectedMenu === menu.id; // Use selectedMenu to determine selection
  return (
    <Card
      className={
        isSelected
          ? "bg-[var(--vscode-editor-selectionBackground)]"
          : "bg-[var(--vscode-editor-inactiveSelectionBackground)]"
      }
      onClick={onClick}
    >
      <CardHeading>
        <IconComponent
          size={16}
          className="icon"
          color={isSelected ? "var(--vscode-terminal-ansiGreen)" : "#fff"}
        />
        {menu.title}
      </CardHeading>
      <CardDescription>{menu.description}</CardDescription>
    </Card>
  );
};

export default MenuCard;
