import { Eye, FileText, List } from "lucide-react";

export interface FilePath {
  path: string;
  name: string;
  extension: string;
  icon: string;
}

// Define the menu item interface
export interface MenuItem {
  id: number;
  value: string;
  title: string;
  description: string;
  icon: keyof typeof lucideIcons;
  isSelected: boolean;
}

export const lucideIcons = { List, FileText, Eye } as const;
