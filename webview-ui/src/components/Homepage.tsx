import { useState, useEffect, useRef } from "react";
import { List, FileText, Eye, Plus, User, RefreshCw } from "lucide-react";

interface Quote {
  quote: string;
  author: string;
}

const Homepage = () => {
  const [input, setInput] = useState("");
  const [showFiles, setShowFiles] = useState<Quote[]>([]);
  const vscodeRef = useRef<any>(null); // Ref to store VS Code API instance

  // Set up message listener and acquire VS Code API once because it is only allowed to use one time and only need to have 1 instance.
  useEffect(() => {
    try {
      const vscode = acquireVsCodeApi();
      vscodeRef.current = vscode; // Store the instance in ref so it does not go away in the refresh
      console.log("VS Code API acquired successfully");
    } catch (e) {
      console.error("Failed to acquire VS Code API:", e);
    }

    //Function to handle the response from the extenion
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log("Frontend received message:", message);

      //using switch statement for getting the data with specifi command
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
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []); // Empty dependency array ensures it runs once and have only 1 instance

  const sendMessageToExtension = () => {
    const vscode = vscodeRef.current; // Use the ref instead of global window.vscode
    if (vscode) {
      console.log("Sending fetchdata message");
      //using the postMessage api to establish a async connection with the extenion
      vscode.postMessage({
        command: "fetchdata",
        url: "https://dummyjson.com/quotes",
        method: "GET",
      });
    } else {
      console.error("VS Code API not available");
    }
  };

  return (
    <div className="container">
      <div className="header">What can I help you build today?</div>
      <p className="subheader">
        Create new code, add features, or fix issues—let's make it happen.
      </p>
      <div className="sections">
        <div className="section">
          <div className="section-title">
            <List
              size={16}
              className="icon"
              color="var(--vscode-terminal-ansiGreen)"
            />
            Phases
          </div>
          <p>
            Start with a conversation to clarify intent, then break the task
            into manageable phases.
          </p>
        </div>
        <div className="section">
          <div className="section-title">
            <FileText size={16} className="icon" />
            Plan
          </div>
          <p>
            Get a detailed file-level plan, refine it with AI, and send it to
            the agent for execution.
          </p>
        </div>
        <div className="section">
          <div className="section-title">
            <Eye size={16} className="icon" />
            Review
          </div>
          <p>
            Execute a comprehensive review to surface issues and deviations, to
            tighten the codebase with AI.
          </p>
        </div>
        <div className="section">
          <div className="section-title">
            <Eye size={16} className="icon" />
            Quotes (API Data)
          </div>
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
        </div>
      </div>
      <div className="input-container">
        <button onClick={sendMessageToExtension}>
          <Plus size={16} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your task (@mention for context)"
        />
        <button>Send (⌘ + ↵)</button>
      </div>
      <footer className="footer">
        <div className="profile">
          <User size={16} />
          Pro (Trial)
        </div>
        <button>
          <RefreshCw size={16} />
        </button>
      </footer>
    </div>
  );
};

export default Homepage;
