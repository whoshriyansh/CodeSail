import { useState } from "react";
import { List, FileText, Eye, Plus, User, RefreshCw } from "lucide-react";

//TODO: Fix the Logo Issue
const Homepage = () => {
  const [input, setInput] = useState("");
  const [showFiles, setShowFiles] = useState(false);

  return (
    <div className="container">
      {/* <img src={Logo} alt="Nice my Icons" /> */}
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
            />{" "}
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
      </div>
      <div className="input-container">
        <button onClick={() => setShowFiles(!showFiles)}>
          <Plus size={16} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your task (@mention for context)"
        />
        <button>Send (⌘ + ↵)</button>
      </div>
      {/* Bottom Footer/Tab Bar */}
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
