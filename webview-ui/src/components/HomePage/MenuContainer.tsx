import { type FunctionComponent } from "react";
import { type MenuItem } from "../../types/Homepage";
import MenuCard from "./MenuCard";
import { twMerge } from "tailwind-merge";

interface MenuContainerProps {
  menuItems: MenuItem[];
  selectedMenu: number | null;
  onMenuClick: (id: number) => void;
  className?: string;
}

const MenuContainer: FunctionComponent<MenuContainerProps> = ({
  menuItems,
  selectedMenu,
  onMenuClick,
  className,
}) => {
  return (
    <div
      className={twMerge(
        "flex flex-col md:flex-row justify-center md:justify-between gap-3 mb-4",
        className
      )}
    >
      {menuItems.map((menu) => (
        <MenuCard
          key={menu.id}
          menu={menu}
          onClick={() => onMenuClick(menu.id)}
          selectedMenu={selectedMenu}
        />
      ))}
    </div>
  );
};

export default MenuContainer;
