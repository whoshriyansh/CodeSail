import { Eye, FileText, List } from "lucide-react";

export interface Quote {
  quote: string;
  author: string;
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
