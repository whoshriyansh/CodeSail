import { useState, useEffect, useRef } from "react";
import type { FilePath, MenuItem } from "../types/Homepage";
import { initialMenuItems } from "../data/Menu";
import Header from "../components/HomePage/Header";
import AnalysisBox from "../components/HomePage/AnalysisBox";
import MenuContainer from "../components/HomePage/MenuContainer";
import InputContainer from "../components/HomePage/InputContainer";
import FileModal from "../components/HomePage/FileModal";
import Footer from "../components/HomePage/Footer";
import { getVsCodeApi } from "../utils/vscode";

interface UserProfile {
  avatar_url: string;
  email: string;
  username: string;
  accessToken?: string;
}

const Homepage = () => {
  const [input, setInput] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<FilePath | null>(null);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileModelOpen, setProfileModelOpen] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null); // New state for key submission feedback
  const vscodeRef = useRef(getVsCodeApi());
  const allFilesRef = useRef<FilePath[]>([]);
  const [displayedFiles, setDisplayedFiles] = useState<FilePath[]>([]);

  const handleFileModalTogl = () => {
    setFileModalOpen((prev) => !prev);
    if (!fileModalOpen && allFilesRef.current.length) {
      setDisplayedFiles(allFilesRef.current.slice(0, 15));
    }
  };

  const handleProfileModalTogl = () => {
    setProfileModelOpen((prev) => !prev);
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

  const sendMessageToExtension = (
    command: string = "fetchdata",
    data?: any
  ) => {
    vscodeRef.current.postMessage({ command, data });
  };

  const sendForAnlyses = () => {
    if (input.trim() === "" || !selectedFile) return;
    const path = selectedFile?.path;
    const name = selectedFile?.name;

    setAnalysisResponse([]);
    setIsLoading(true);
    sendMessageToExtension("Analyse File", {
      fileName: name,
      filePath: path,
      prompt: input,
    });
  };

  const sendAuthReq = () => {
    setIsLoading(true);
    sendMessageToExtension("Github Authentication");
  };

  const sendKeySubmission = () => {
    setIsLoading(true);
    setKeyStatus(null); // Clear previous status
    sendMessageToExtension("Submit Grok Key");
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

  useEffect(() => {
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
          setIsLoading(false);
          setKeyStatus(message.text); // Show error in UI
          break;
        }
        case "analysisChunk": {
          setAnalysisResponse((prev) => [...prev, message.data.content]);
          break;
        }
        case "analysisComplete": {
          setIsLoading(false);
          break;
        }
        case "userProfile": {
          setUserProfile({
            ...message.data,
            accessToken: message.data.accessToken || undefined,
          });
          setIsLoading(false);
          break;
        }
        case "signedOut": {
          setUserProfile(null);
          setIsLoading(false);
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
        case "keySaved": {
          setKeyStatus("Grok API key saved successfully!");
          setIsLoading(false);
          break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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
        userStatus={userProfile ? "Pro (Authenticated)" : "Guest"}
        isOpen={profileModelOpen}
        onClose={handleProfileModalTogl}
        profile={userProfile}
        onSignIn={sendAuthReq}
        isLoading={isLoading}
        sendKeySubmission={sendKeySubmission}
        keyStatus={keyStatus} // Pass key status to Footer
      />
    </div>
  );
};

export default Homepage;
