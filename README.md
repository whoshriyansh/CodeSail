# CodeSail: Simplified Planning Layer for Coding Agents

loom.com/share/752aa7884c304b609b71b37e75e8ab74

## Ollama Model Installation

Install the [Ollama](https://ollama.com/) App in your system

Run this command from your terminal:

```bash
ollama run qwen2.5-coder
```

## For running Second time

For Next time run:

```bash
ollama serve
```

In another terminal run:

```bash
ollama run qwen2.5-coder
```

For stoping the LLM:

```bash
ollama stop qwen2.5-coder
```

This is a **simplified recreation of Traycer AI** as a VS Code extension, demonstrating the core "planning layer" concept. CodeSail acts as an intelligent orchestrator for coding agents: it analyzes your codebase, breaks tasks into structured, step-by-step plans, and generates actionable fixes/suggestions. This clone uses Groq AI (via `llama-3.1-8b-instant`) as the underlying agent to mimic this—providing precise planning before code changes, ensuring reliable, auditable outputs.

Built in **TypeScript** with a **React-based webview UI** (styled with Tailwind CSS), it integrates seamlessly into VS Code. No backend required—API keys are stored securely via VS Code's `SecretStorage`.

## Why This Captures Traycer's Vision

- **Agent Integration**: Uses Groq as the "coding agent" for analysis/planning; extensible to Claude/Cursor.
- **Verification & Review**: Outputs include issues (with severity), suggestions, fixed code, and change summaries—mirroring Traycer's auditability.
- **Creativity**: Sidebar webview for interactive planning; secure per-user Grok key storage; async streaming for real-time feedback.
- **Ease of Use**: One-click file selection + prompt → Instant plan/fixes in VS Code.

This is a minimal, focused implementation to showcase builder thinking: Clean, modular code (Node.js extension + React UI) that works on large codebases without over-engineering.

## Features

- **AI Code Planning & Analysis**: Upload code + task (e.g., "Fix auth bug") → Groq generates step-by-step plan, issues, suggestions, and fixed code.
- **Structured Output**:
  - **Thinking Phase**: [STEP 1-6] reasoning.
  - **Final Plan**: Markdown with walkthrough, issues (Low/Med/High), suggestions, full fixed code, and diff summary.
- **Secure Grok Integration**: Prompt for API key on first use; stored encrypted (no exposure).
- **GitHub Auth**: Optional login for user profile (avatar/email in UI).
- **Modern UI**: Responsive React sidebar with Tailwind; light/dark theme support; file search/modal.
- **Streaming Responses**: Real-time chunks for fast, interactive feedback.

## Requirements

- **VS Code**: v1.93.0+.
- **Grok API Key**: Free from [console.ai](https://console.groq.com/keys) (powers the planning agent).
- **Node.js**: v20+ (for local dev/build).

## Installation & Setup

1. **Install Extension**:

   - Search "CodeSail" in VS Code Extensions view (`Ctrl+Shift+X`).
   - Install and reload VS Code.

2. **Configure Grok API Key**:

   - Open the CodeSail sidebar (activity bar icon).
   - Click user icon (bottom footer) → "Submit Grok API Key".
   - Enter key from [console.ai](https://console.groq.com/keys) → Saved securely (no re-entry needed).

3. **Optional: GitHub Login**:

   - In sidebar footer → "Sign In with GitHub" → Authorize in browser.
   - Shows your profile in the UI.

4. **Usage**:
   - Open CodeSail sidebar.
   - Search/select a file (excludes node_modules/.git).
   - Enter task prompt (e.g., "Add login validation").
   - Click "Send" → Watch planning stream: Steps → Final plan/fixes.
   - Copy fixed code or apply changes manually.

## Changelog

**0.0.2 (2025-10-13)**

- Bundled deps for reliable publishing.
- Enhanced planning output for better agent integration.
