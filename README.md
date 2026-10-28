# Gemini Lumina Synth — Modern AI Chatbot

A fast, modern, and responsive AI chatbot application built with React, Vite, Express, Tailwind CSS, and the free tier of the **Google Gemini API** (`@google/genai` SDK).

Inspired by cutting-edge conversational AI interfaces, it features persistent browser LocalStorage, real-time Server-Sent Events (SSE) streaming, syntax-highlighted code blocks, prompt templates, voice dictation, and full CRUD operations.

---

## ✨ Features

- **⚡ Fast Streaming Responses**: Real-time token streaming via native Server-Sent Events (SSE).
- **🛡️ Secure Server Proxy**: The Gemini API key is managed server-side (`server.ts`) and is never leaked to client bundles.
- **💾 Full LocalStorage CRUD Operations**:
  - **Create**: Initiate new threads, multimodal prompts with attached images, or template prompts.
  - **Read**: Chronologically organized conversation history ("Today", "Previous 7 Days", "Previous 30 Days") with real-time thread search.
  - **Update**: Rename conversation titles inline and edit previous user prompts with instant regeneration.
  - **Delete**: Delete individual messages, clear active threads, or wipe all history with confirmation dialogs.
- **🎨 Lumina Synth Design System**:
  - Deep obsidian dark canvas with radiant emerald (`#10B981`) and electric cyan (`#06B6D4`) highlights.
  - Light & dark mode support.
  - Collapsible responsive sidebar with mobile drawer support.
- **💻 High-Fidelity Code Rendering**:
  - Traffic-light macOS window header with language badges.
  - One-click "Copy Code" with visual checkmark feedback.
  - Formatted line numbering (`01`, `02`, `03`).
- **🌐 Google Search Grounding**: Toggle web search grounding to fetch live internet results.
- **🎙️ Voice Dictation & Text-to-Speech**: Speech-to-text dictation in the composer and read-aloud playback for responses.
- **📊 Free-Tier Diagnostics & Quota Meter**: Track daily chats against the 15 RPM / 1M TPM free allowance.
- **📂 Export & Backup**: Export single chats as Markdown or full conversation archives as JSON, with JSON restore.

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** v18+ or v20+
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 2. Environment Variables

Create a `.env` file in the root directory (based on `.env.example`):

```bash
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
```

> **Note**: In Google AI Studio, `GEMINI_API_KEY` is injected automatically via the **Secrets** panel.

### 3. Installation

```bash
npm install
```

### 4. Development

Run the full-stack dev server (Express backend + Vite middleware on port 3000):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build

```bash
npm run build
npm start
```

---

## ☁️ Vercel Deployment

This project can be deployed to Vercel:

1. Push your repository to GitHub or GitLab.
2. Import the project into the [Vercel Dashboard](https://vercel.com/).
3. In **Project Settings > Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. Deploy!

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Start a new chat |
| `Enter` | Send message |
| `Shift + Enter` | Insert new line in composer |
| `Esc` | Stop active generation |

---

## 📄 License

Apache-2.0
