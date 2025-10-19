import { useState, useEffect, useRef } from "react";
import type { FilePath } from "../types/Homepage";
import Header from "../components/HomePage/Header";
import AnalysisBox from "../components/HomePage/AnalysisBox";
import InputContainer from "../components/HomePage/InputContainer";
import FileModal from "../components/HomePage/FileModal";
import { getVsCodeApi } from "../utils/vscode";
import Footer from "../components/HomePage/Footer";

interface ThinkingStep {
  step_number: number;
  step_title: string;
  step_description: string;
}

interface AnalysisResponse {
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

const Homepage = () => {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<FilePath | null>(null);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [finalAnswer, setFinalAnswer] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const vscodeRef = useRef(getVsCodeApi());
  const allFilesRef = useRef<FilePath[]>([]);
  const [displayedFiles, setDisplayedFiles] = useState<FilePath[]>([]);

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
    setThinkingSteps([]);
    setFinalAnswer(null);
    setError("");
    setIsLoading(false);
  };

  // Send message to backend
  const sendMessageToExtension = (command: string, data?: any) => {
    vscodeRef.current.postMessage({ command, data });
  };

  // Send analysis request
  const sendForAnlyses = () => {
    if (input.trim() === "" || !selectedFile) return;
    const { path, name } = selectedFile;
    handleClearAnalysis();
    setIsLoading(true);
    sendMessageToExtension("Analyse File", {
      fileName: name,
      filePath: path,
      prompt: input,
    });

    setSearchTerm("");
    setSelectedFile(null);
  };

  // Send Github Authentication Request
  const sendForGithubLogin = () => {
    setIsLoading(true);
    sendMessageToExtension("github-authentication");
  };

  // Handle messages from backend
  useEffect(() => {
    sendMessageToExtension("fetchdata");
    sendMessageToExtension("user-status");

    const handleMessage = (event: MessageEvent) => {
      const { command, text, data } = event.data;
      switch (command) {
        case "all-files": {
          allFilesRef.current = data;
          setDisplayedFiles(data.slice(0, 15));
          break;
        }
        case "analysisStart": {
          setThinkingSteps([]);
          setFinalAnswer(null);
          setIsLoading(true);
          break;
        }
        case "final": {
          try {
            const parsed = JSON.parse(text);
            setFinalAnswer(parsed);
            setThinkingSteps(parsed.thinking_steps || []);
            setIsLoading(false);
          } catch (e: any) {
            console.log("Error parsing final response:", e);
            setError("Invalid response format from AI.");
            setIsLoading(false);
          }
          break;
        }
        case "profileFromLocalStorage": {
          setUserProfile(data);
          break;
        }
        case "userProfile": {
          setUserProfile(data);
          setIsLoading(false);
          break;
        }
        case "error": {
          setError(text);
          setThinkingSteps([]);
          setFinalAnswer(null);
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
        <div className="flex flex-col items-center justify-center h-[100vh] bg-[var(--vscode-editor-background)] text-[var(--vscode-foreground)]">
          <div className="text-lg mb-4">No User Profile</div>
          <button
            onClick={sendForGithubLogin}
            className="px-4 py-2 bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] rounded-md hover:bg-[var(--vscode-button-hoverBackground)] transition"
          >
            Sign In
          </button>
        </div>
      ) : (
        <div className="flex flex-col px-4 py-4 h-[100vh] bg-[var(--vscode-editor-background)] text-[var(--vscode-foreground)] overflow-y-hidden">
          <Header
            title="What can I help you build today?"
            subtitle="Create new code, add features, or fix issues—let's make it happen."
          />
          <AnalysisBox
            thinkingSteps={thinkingSteps}
            finalAnswer={finalAnswer}
            error={error}
            onClear={handleClearAnalysis}
            isLoading={isLoading}
          />
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
