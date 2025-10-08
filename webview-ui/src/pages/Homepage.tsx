import { useState, useEffect, useRef } from "react";
import { Eye, Plus, User, RefreshCw } from "lucide-react";
import { Card, CardHeading } from "../components/ui/card/Card";
import Button from "../components/ui/button/Button";
import { FormButton, Input } from "../components/ui/formFields/FormFields";
import { type MenuItem, type Quote } from "../types/Homepage";
import MenuCard from "../components/HomePage/MenuCard";

const initialMenuItems: MenuItem[] = [
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

const Homepage = () => {
  const [input, setInput] = useState("");
  const [showFiles, setShowFiles] = useState<Quote[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null); // Track selected menu ID
  const vscodeRef = useRef<any>(null);

  useEffect(() => {
    try {
      const vscode = acquireVsCodeApi();
      vscodeRef.current = vscode;
      console.log("VS Code API acquired successfully");
    } catch (e) {
      console.error("Failed to acquire VS Code API:", e);
    }

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log("Frontend received message:", message);

      switch (message.command) {
        case "apiResponse":
          if (message.data && Array.isArray(message.data.quotes)) {
            console.log("Setting quotes:", message.data.quotes);
            setShowFiles(message.data.quotes);
          } else {
            console.warn(
              "Invalid data format, expected quotes array:",
              message.data
            );
            setShowFiles([]);
          }
          break;
        case "error":
          console.error("Error from extension:", message.text);
          alert(`Error: ${message.text}`);
          break;
        case "Phases":
        case "Plan":
        case "Review":
          console.log(
            `Received response for ${message.command}:`,
            message.data
          );
          // Handle specific responses here if needed
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const sendMessageToExtension = (command: string = "fetchdata") => {
    const vscode = vscodeRef.current;
    if (vscode) {
      console.log(`Sending ${command} message`);
      vscode.postMessage({
        command,
        url:
          command === "fetchdata" ? "https://dummyjson.com/quotes" : undefined,
        method: "GET",
      });
    } else {
      console.error("VS Code API not available");
    }
  };

  const handleMenuClick = (id: number) => {
    setSelectedMenu(id); // Update selectedMenu state
    const updatedMenuItems = menuItems.map((item) =>
      item.id === id
        ? { ...item, isSelected: true }
        : { ...item, isSelected: false }
    );
    setMenuItems(updatedMenuItems); // Sync menuItems state with selection
    console.log("Selected menu:", id);

    // Send command based on selected menu value
    const selectedItem = menuItems.find((item) => item.id === id);
    if (selectedItem) {
      sendMessageToExtension(selectedItem.value);
    }
  };

  return (
    <div className="flex flex-col px-4 py-2 overflow-y-auto h-[100vh]">
      <div className="header text-center text-lg font-semibold mb-1">
        What can I help you build today?
      </div>
      <p className="subheader text-center text-sm mb-4">
        Create new code, add features, or fix issues—let's make it happen.
      </p>
      <div className="flex flex-col md:flex-row justify-center md:justify-between gap-3 mb-4">
        {menuItems.map((menu) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            onClick={() => handleMenuClick(menu.id)}
            selectedMenu={selectedMenu}
          />
        ))}
        <Card>
          <CardHeading>
            <Eye size={16} className="icon" />
            Quotes (API Data)
          </CardHeading>
          <ul>
            {showFiles.length > 0 ? (
              showFiles.map((item, index) => (
                <li key={index}>
                  "{item.quote}" - <em>{item.author}</em>
                </li>
              ))
            ) : (
              <li>No data loaded. Click + to fetch.</li>
            )}
          </ul>
        </Card>
      </div>
      <div className="input-container flex items-center gap-2 border border-solid rounded-md p-2 mt-auto">
        <Button onClick={() => sendMessageToExtension()}>
          <Plus size={10} />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your task (@mention for context)"
        />
        <FormButton
          onClick={() => {
            console.log("Sending input:", input);
            // Add send logic here if needed
          }}
        >
          Send (⌘ + ↵)
        </FormButton>
      </div>
      <footer className="footer flex items-center justify-between p-3 border-t border-solid rounded-md text-sm font-medium mb-2">
        <div className="flex items-center gap-2">
          <User size={10} />
          Pro (Trial)
        </div>
        <FormButton
          onClick={() => {
            sendMessageToExtension();
            console.log("Refreshing");
          }}
        >
          <RefreshCw size={10} />
        </FormButton>
      </footer>
    </div>
  );
};

export default Homepage;
