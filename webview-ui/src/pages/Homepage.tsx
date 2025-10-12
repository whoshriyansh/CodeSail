import { useState, useEffect, useRef } from "react";
import type { FilePath, MenuItem } from "../types/Homepage";
import { initialMenuItems } from "../data/Menu";
import Header from "../components/HomePage/Header";
import AnalysisBox from "../components/HomePage/AnalysisBox";
import MenuContainer from "../components/HomePage/MenuContainer";
import InputContainer from "../components/HomePage/InputContainer";
import FileModal from "../components/HomePage/FileModal";
import Footer from "../components/HomePage/Footer";

const Homepage = () => {
  const [input, setInput] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<FilePath | null>(null);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [analysisResponse, setAnalysisResponse] = useState<string[]>([]);
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
    setDisplayedFiles(filtered.slice(0, 15));
    if (value.trim() === "") {
      setDisplayedFiles(allFilesRef.current.slice(0, 15));
    }
  };

  const handleClearAnalysis = () => {
    setAnalysisResponse([]);
    setSelectedMenu(null);
    setMenuItems(initialMenuItems);
  };

  useEffect(() => {
    try {
      const vscode = acquireVsCodeApi();
      vscodeRef.current = vscode;
      console.log("VS Code API acquired successfully");
    } catch (e) {
      console.error("Failed to acquire VS Code API:", e);
    }

    sendMessageToExtension();

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
    <div className="flex flex-col px-2 py-2 overflow-y-hidden h-[100vh]">
      <Header
        title="What can I help you build today?"
        subtitle="Create new code, add features, or fix issues—let's make it happen."
      />
      {analysisResponse.length > 0 ? (
        <AnalysisBox
          analysisResponse={analysisResponse}
          onClear={handleClearAnalysis}
        />
      ) : (
        <MenuContainer
          menuItems={menuItems}
          selectedMenu={selectedMenu}
          onMenuClick={handleMenuClick}
        />
      )}
      <InputContainer
        fileModalOpen={fileModalOpen}
        selectedFile={selectedFile}
        input={input}
        onFileModalToggle={handleFileModalTogl}
        onInputChange={(e) => setInput(e.target.value)}
        onSend={sendForAnlyses}
        searchTerm={searchTerm}
        onSearch={handleSearch}
      />
      <FileModal
        isOpen={fileModalOpen}
        onClose={handleFileModalTogl}
        files={displayedFiles}
        onSelectFile={handleSelectFile}
      />
      <Footer
        userStatus="Pro (Trial)"
        onRefresh={() => console.log("Refresh clicked")}
      />
    </div>
  );
};

export default Homepage;
