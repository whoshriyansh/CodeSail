import { useState, useEffect, useRef } from "react";
import {
  Plus,
  User,
  RefreshCw,
  File as DefaultFileIcon,
  FileText,
  Image,
  Code,
  Cross,
} from "lucide-react";
import Button from "../components/ui/button/Button";
import { FormButton, Input } from "../components/ui/formFields/FormFields";
import { type FilePath, type MenuItem } from "../types/Homepage";
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

// Extension-icon mapping (extend as needed)
const getFileIcon = (ext: string) => {
  switch (ext) {
    case "ts":
    case "js":
    case "tsx":
    case "jsx":
      return <Code size={14} />;
    case "json":
    case "md":
    case "txt":
      return <FileText size={14} />;
    case "png":
    case "jpg":
    case "jpeg":
    case "svg":
      return <Image size={14} />;
    default:
      return <DefaultFileIcon size={14} />;
  }
};

const Homepage = () => {
  const [input, setInput] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<FilePath | null>(null);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [analysisResponse, setAnalysisResponse] = useState<string[]>([]); // New state for analysis chunks

  const vscodeRef = useRef<any>(null);
  const allFilesRef = useRef<FilePath[]>([]);
  const [displayedFiles, setDisplayedFiles] = useState<FilePath[]>([]);

  const handleFileModalTogl = () => {
    setFileModalOpen((prev) => !prev);
    if (!fileModalOpen && allFilesRef.current.length) {
      setDisplayedFiles(allFilesRef.current.slice(0, 15));
    }
  };

  const handleSelectFile = (file: FilePath) => {
    setSelectedFile(file);
    setFileModalOpen(false);
    setSearchTerm("");
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = allFilesRef.current.filter((file) =>
      file.name.toLowerCase().includes(value.toLowerCase())
    );
    setDisplayedFiles(filtered.slice(0, 15)); // Always limit to 15
    if (value.trim() === "") {
      setDisplayedFiles(allFilesRef.current.slice(0, 15));
    }
  };

  // Clear analysis response to show menu again
  const handleClearAnalysis = () => {
    setAnalysisResponse([]);
    setSelectedMenu(null); // Reset menu selection
    setMenuItems(initialMenuItems); // Reset menu items
  };

  // Fetch VSCode API and handle messages
  useEffect(() => {
    try {
      const vscode = acquireVsCodeApi();
      vscodeRef.current = vscode;
      console.log("VS Code API acquired successfully");
    } catch (e) {
      console.error("Failed to acquire VS Code API:", e);
    }

    sendMessageToExtension(); // Initial fetch

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      switch (message.command) {
        case "all-files": {
          allFilesRef.current = message.data;
          setDisplayedFiles(message.data.slice(0, 15));
          break;
        }
        case "error": {
          console.error("Error from extension:", message.text);
          alert(`Error: ${message.text}`);
          break;
        }
        case "analysisChunk": {
          // Append chunk to analysis response
          setAnalysisResponse((prev) => [...prev, message.data.content]);
          break;
        }
        case "analysisComplete": {
          break;
        }
        case "File Recived": {
          console.log("Analysed File Successful", message.data);
          break;
        }
        case "Plan":
        case "Review": {
          console.log(
            `Received response for ${message.command}:`,
            message.data
          );
          break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const sendMessageToExtension = (command: string = "fetchdata") => {
    const vscode = vscodeRef.current;
    if (vscode) {
      vscode.postMessage({ command });
    } else {
      console.error("VS Code API not available");
    }
  };

  const sendForAnlyses = () => {
    const vscode = vscodeRef.current;

    if (input.trim() === "" || !selectedFile) return;

    const path = selectedFile?.path;
    const name = selectedFile?.name;

    if (vscode) {
      // Clear previous analysis before sending new request
      setAnalysisResponse([]);
      vscode.postMessage({
        command: "Analyse File",
        data: {
          fileName: name,
          filePath: path,
          prompt: input,
        },
      });
    }
  };

  const handleMenuClick = (id: number) => {
    setSelectedMenu(id);
    const updatedMenuItems = menuItems.map((item) =>
      item.id === id
        ? { ...item, isSelected: true }
        : { ...item, isSelected: false }
    );
    setMenuItems(updatedMenuItems);
    const selectedItem = menuItems.find((item) => item.id === id);
    if (selectedItem) sendMessageToExtension(selectedItem.value);
  };

  return (
    <div className="flex flex-col px-4 py-2 overflow-y-auto h-[100vh]">
      <div className="header text-center text-lg font-semibold mb-1">
        What can I help you build today?
      </div>
      <p className="subheader text-center text-sm mb-4">
        Create new code, add features, or fix issues—let's make it happen.
      </p>

      {/* Conditionally render Menu or Analysis Box */}
      {analysisResponse.length > 0 ? (
        <div className="analysis-box flex flex-col gap-2 p-4 border border-solid rounded-md bg-[var(--vscode-editor-background)] max-h-[60vh] overflow-y-auto mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Code Analysis</h2>
            <Button onClick={handleClearAnalysis}>
              <Cross size={14} /> Clear
            </Button>
          </div>
          <pre className="text-sm whitespace-pre-wrap">
            {analysisResponse.join("\n")}
          </pre>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-center md:justify-between gap-3 mb-4">
          {menuItems.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              onClick={() => handleMenuClick(menu.id)}
              selectedMenu={selectedMenu}
            />
          ))}
        </div>
      )}

      {/* Input + File Modal Toggle */}
      <div className="input-container flex items-center gap-2 border border-solid rounded-md p-2 mt-auto relative">
        {fileModalOpen ? (
          <Input
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for File"
          />
        ) : selectedFile ? (
          <Input
            value={selectedFile.name}
            onClick={handleFileModalTogl}
            readOnly
          />
        ) : (
          <Button onClick={handleFileModalTogl}>
            <Plus size={10} />
          </Button>
        )}
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your task (@mention for context)"
        />
        <FormButton onClick={sendForAnlyses}>Send (⌘ + ↵)</FormButton>
        {/* File Modal */}
        {fileModalOpen && (
          <div
            className={`absolute left-10 bottom-12 max-h-[40vh] w-3/4 md:w-2/4 overflow-y-auto z-10 border-1 border-solid rounded-t-md p-5 bg-[var(--vscode-editor-selectionBackground)] flex flex-col gap-2`}
          >
            <Button
              className="sticky"
              onClick={() => {
                setFileModalOpen((prev) => !prev);
              }}
            >
              <Cross />
            </Button>
            <ul className="space-y-2">
              {displayedFiles.length > 0 ? (
                <>
                  {displayedFiles.map((file, index) => {
                    const ext = file.name.split(".").pop()?.toLowerCase() || "";
                    return (
                      <li
                        key={index}
                        className="flex justify-between items-center gap-2 cursor-pointer"
                        onClick={() => handleSelectFile(file)}
                      >
                        <div className="flex items-center gap-2">
                          {getFileIcon(ext)}
                          <p className="font-medium">{file.name}</p>
                        </div>
                        <p className="text-xs truncate max-w-[60%]">
                          {file.path}
                        </p>
                      </li>
                    );
                  })}
                </>
              ) : (
                <li>No files found.</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer flex items-center justify-between p-3 border-t border-solid rounded-md text-sm font-medium mb-2">
        <div className="flex items-center gap-2">
          <User size={10} />
          Pro (Trial)
        </div>
        <FormButton
          onClick={() => {
            console.log("Refresh clicked");
          }}
        >
          <RefreshCw size={10} />
        </FormButton>
      </footer>
    </div>
  );
};

export default Homepage;
