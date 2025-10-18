import { useState, useEffect, useRef } from "react";
import type { FilePath } from "../types/Homepage";
import Header from "../components/HomePage/Header";
import AnalysisBox from "../components/HomePage/AnalysisBox";
import InputContainer from "../components/HomePage/InputContainer";
import FileModal from "../components/HomePage/FileModal";
import { getVsCodeApi } from "../utils/vscode";
import Footer from "../components/HomePage/Footer";

//Make a function to make api call
//Add it to run initially
//Send the profile to the Footer

const Homepage = () => {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<FilePath | null>(null);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [thinking, setThinking] = useState("");
  const [streamedResponse, setStreamedResponse] = useState("");
  const [finalAnswer, setFinalAnswer] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const vscodeRef = useRef(getVsCodeApi());
  const allFilesRef = useRef<FilePath[]>([]);
  const [displayedFiles, setDisplayedFiles] = useState<FilePath[]>([]);
  const [userProfile, setUserProfile] = useState(null);

  // Toggle file modal and show initial files
  const handleFileModalTogl = () => {
    setFileModalOpen((prev) => !prev);
    if (!fileModalOpen && allFilesRef.current.length) {
      setDisplayedFiles(allFilesRef.current.slice(0, 15));
    }
  };

  // Select a file and close modal
  const handleSelectFile = (file: FilePath) => {
    setSelectedFile(file);
    setFileModalOpen(false);
    setSearchTerm("");
  };

  // Filter files based on search term
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

  // Clear analysis results
  const handleClearAnalysis = () => {
    setThinking("");
    setStreamedResponse("");
    setFinalAnswer("");
    setError("");
  };

  // Send message to backend
  const sendMessageToExtension = (command: string, data?: any) => {
    vscodeRef.current.postMessage({ command, data });
  };

  // Send analysis request
  const sendForAnlyses = () => {
    if (input.trim() === "" || !selectedFile) return;
    const path = selectedFile?.path;
    const name = selectedFile?.name;

    handleClearAnalysis();
    setIsLoading(true);
    sendMessageToExtension("Analyse File", {
      fileName: name,
      filePath: path,
      prompt: input,
    });
  };

  // Send Github Authetication Request
  const sendForGithubLogin = () => {
    setIsLoading(true);
    sendMessageToExtension("github-authentication");
  };

  // Handle messages from backend
  useEffect(() => {
    sendMessageToExtension("fetchdata");
    sendMessageToExtension("user-status");

    const handleMessage = (event: MessageEvent) => {
      const { command, text } = event.data;
      switch (command) {
        case "all-files": {
          allFilesRef.current = event.data.data;
          setDisplayedFiles(event.data.data.slice(0, 15));
          break;
        }
        case "analysisStart": {
          setThinking(text);
          setIsLoading(true);
          break;
        }
        case "thinkingStart": {
          setThinking("Starting analysis...");
          break;
        }
        case "thinking": {
          setThinking((prev) => prev + text);
          break;
        }
        case "streamStart": {
          setThinking("");
          setStreamedResponse("");
          break;
        }
        case "stream": {
          setStreamedResponse((prev) => prev + text);
          break;
        }
        case "final": {
          setFinalAnswer(text);
          setStreamedResponse("");
          setIsLoading(false);
          break;
        }
        case "profileFromLocalStorage": {
          setUserProfile(event.data.data);
          break;
        }
        case "userProfile": {
          setUserProfile(event.data.data);
          break;
        }
        case "error": {
          setError(text);
          setThinking("");
          setStreamedResponse("");
          setFinalAnswer("");
          setIsLoading(false);
          break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <>
      {!userProfile ? (
        <>
          <div>No, User Profile</div>
          <button onClick={sendForGithubLogin}>Sign In</button>
        </>
      ) : (
        <div className="flex flex-col px-2 py-2 overflow-y-hidden h-[100vh]">
          <Header
            title="What can I help you build today?"
            subtitle="Create new code, add features, or fix issues—let's make it happen."
          />
          {(thinking || streamedResponse || finalAnswer || error) && (
            <AnalysisBox
              thinking={thinking}
              streamedResponse={streamedResponse}
              finalAnswer={finalAnswer}
              error={error}
              onClear={handleClearAnalysis}
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
          <Footer onSignIn={sendForGithubLogin} profile={userProfile} />
        </div>
      )}
    </>
  );
};

export default Homepage;
