import type { MenuItem } from "../types/Homepage";

export const initialMenuItems: MenuItem[] = [
  {
    id: 1,
    value: "Phases",
    title: "Phases",
    description:
      "Start with a conversation to clarify intent, then break the task into manageable phases.",
    icon: "List",
    isSelected: false,
  },
  {
    id: 2,
    value: "Plan",
    title: "Plan",
    description:
      "Get a detailed file-level plan, refine it with AI, and send it to the agent for execution.",
    icon: "FileText",
    isSelected: false,
  },
  {
    id: 3,
    value: "Review",
    title: "Review",
    description:
      "Execute a comprehensive review to surface issues and deviations, to tighten the codebase with AI.",
    icon: "Eye",
    isSelected: false,
  },
];
