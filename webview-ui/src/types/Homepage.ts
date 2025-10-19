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

export interface ThinkingStep {
  step_number: number;
  step_title: string;
  step_description: string;
}

export interface AnalysisResponse {
  task_name: string;
  thinking_steps: ThinkingStep[];
  pr_title: string;
  pr_description: string;
  file_changes: {
    file_status: "new" | "modified" | "deleted";
    file_path: string;
    file_content?: string;
  }[];
  clarification?: {
    message: string;
    questions: string[];
  };
}

export const lucideIcons = { List, FileText, Eye } as const;
