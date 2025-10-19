import { useState, useEffect, useRef, useCallback } from "react";
import type { FilePath } from "../types/Homepage";
import Header from "../components/HomePage/Header";
import AnalysisBox from "../components/HomePage/AnalysisBox";
import InputContainer from "../components/HomePage/InputContainer";
import FileModal from "../components/HomePage/FileModal";
import { getVsCodeApi } from "../utils/vscode";
import Footer from "../components/HomePage/Footer";
import { FormButton } from "../components/ui/formFields/FormFields";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card/Card";

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
    setInput("");
  };

  // Send Github Authentication Request
  const sendForGithubLogin = useCallback(() => {
    setIsLoading(true);
    sendMessageToExtension("github-authentication");
  }, []);

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
        <div className="flex flex-col items-center justify-center h-[100vh] bg-[var(--vscode-editor-background)] text-[var(--vscode-foreground)] p-6">
          <Card className="bg-[var(--vscode-input-background)] shadow-sm rounded-lg p-6 max-w-md w-full">
            <CardTitle className="text-xl font-bold text-[var(--vscode-foreground)]">
              Welcome to the Code Analysis Extension
            </CardTitle>
            <CardDescription className="text-[var(--vscode-descriptionForeground)] space-y-4">
              <p>
                To get started, please sign in with your GitHub account. This
                extension is free to use and requires Ollama with the
                <code className="text-[var(--vscode-editor-foreground)] bg-[var(--vscode-editor-background)] px-1 rounded">
                  qwen2.5-coder
                </code>{" "}
                model to function.
              </p>
              <div>
                <strong>Setup Instructions:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>
                    Install{" "}
                    <a
                      href="https://ollama.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--vscode-textLink-foreground)] hover:underline"
                    >
                      Ollama
                    </a>{" "}
                    on your system.
                  </li>
                  <li>
                    Pull the{" "}
                    <code className="text-[var(--vscode-editor-foreground)] bg-[var(--vscode-editor-background)] px-1 rounded">
                      qwen2.5-coder
                    </code>{" "}
                    model using the command:{" "}
                    <code className="text-[var(--vscode-editor-foreground)] bg-[var(--vscode-editor-background)] px-1 rounded">
                      ollama pull qwen2.5-coder
                    </code>
                  </li>
                  <li>Run Ollama to enable code analysis.</li>
                  <li>Sign in below to start using the extension for free!</li>
                </ul>
              </div>
            </CardDescription>
            <div className="mt-6 flex justify-center">
              <FormButton
                onClick={sendForGithubLogin}
                className="px-6 py-2 bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] rounded-md hover:bg-[var(--vscode-button-hoverBackground)] transition-colors duration-200 font-semibold"
              >
                Sign In with GitHub
              </FormButton>
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col h-[100vh] bg-[var(--vscode-editor-background)] text-[var(--vscode-foreground)] overflow-hidden">
          <Header
            title="What can I help you build today?"
            subtitle="Create new code, add features, or fix issues—let's make it happen."
          />
          <div className="flex-1 min-h-0 px-4 py-2">
            <AnalysisBox
              thinkingSteps={thinkingSteps}
              finalAnswer={finalAnswer}
              error={error}
              onClear={handleClearAnalysis}
              isLoading={isLoading}
            />
          </div>
          <div className="px-4 py-2">
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
        </div>
      )}
    </>
  );
};

export default Homepage;
