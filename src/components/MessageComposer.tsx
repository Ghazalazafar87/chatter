import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Globe,
  Code2,
  Mic,
  MicOff,
  X,
  FileImage,
  Brain,
  Bug,
  FileText,
  CheckCircle,
} from 'lucide-react';

interface MessageComposerProps {
  onSendMessage: (text: string, image?: string) => void;
  onStopGenerating: () => void;
  isGenerating: boolean;
  activeModel: string;
  useSearch: boolean;
  onToggleSearch: () => void;
  codeExecMode: boolean;
  onToggleCodeExec: () => void;
  theme?: 'pastel' | 'dark' | 'light';
}

const SUGGESTED_PROMPTS = [
  {
    icon: Brain,
    color: 'text-[#4edea3]',
    title: 'Explain Next.js caching',
    prompt: 'Can you explain the 4 levels of caching in Next.js App Router (Request Memoization, Data Cache, Full Route Cache, Router Cache)?',
  },
  {
    icon: Bug,
    color: 'text-[#4cd7f6]',
    title: 'Fix TypeScript hydration bug',
    prompt: 'How do I diagnose and fix "Text content did not match server-rendered HTML" hydration mismatches in React/Next.js?',
  },
  {
    icon: FileText,
    color: 'text-[#c0c1ff]',
    title: 'Summarize document',
    prompt: 'Summarize the core concepts of building scalable AI agents with low-latency streaming and local state caching.',
  },
  {
    icon: CheckCircle,
    color: 'text-[#4edea3]',
    title: 'Write unit test',
    prompt: 'Write clean Vitest unit tests for a custom React hook that manages localStorage synchronization and optimistic updates.',
  },
];

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onStopGenerating,
  isGenerating,
  activeModel,
  useSearch,
  onToggleSearch,
  codeExecMode,
  onToggleCodeExec,
  theme = 'pastel',
}) => {
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        160,
        Math.max(48, textareaRef.current.scrollHeight)
      )}px`;
    }
  }, [input]);

  // Voice dictation setup
  const toggleRecording = () => {
    if (typeof window === 'undefined') return;

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      alert('Speech Recognition is not supported by your current browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsRecording(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() && !attachedImage) return;
    if (isGenerating) return;

    onSendMessage(input.trim(), attachedImage || undefined);
    setInput('');
    setAttachedImage(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAttachedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const PASTEL_CHIP_STYLES = [
    'bg-[#f3e8ff] border-[#e9d5ff] text-[#6b21a8] hover:bg-[#ede9fe]',
    'bg-[#ede9fe] border-[#ddd6fe] text-[#5b21b6] hover:bg-[#ddd6fe]/70',
    'bg-[#fae8ff] border-[#f5d0fe] text-[#86198f] hover:bg-[#f5d0fe]/70',
    'bg-[#e0e7ff] border-[#c7d2fe] text-[#3730a3] hover:bg-[#c7d2fe]/70',
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 lg:left-[260px] px-4 sm:px-6 pb-4 pt-2 z-20 pointer-events-none transition-colors ${
        theme === 'pastel'
          ? 'bg-gradient-to-t from-[#faf5ff] via-[#faf5ff]/95 to-transparent'
          : theme === 'light'
          ? 'bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/95 to-transparent'
          : 'bg-gradient-to-t from-[#121318] via-[#121318]/95 to-transparent'
      }`}
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-2 pointer-events-auto">
        {/* Floating Stop Generating Button (Esc) */}
        {isGenerating && (
          <div className="flex justify-center -mb-0.5">
            <button
              onClick={onStopGenerating}
              className={`group flex items-center gap-2 px-4 py-1.5 rounded-full shadow-xl transition-all border ${
                theme === 'pastel'
                  ? 'bg-[#ffffff] hover:bg-[#f3e8ff] border-[#e9d5ff] text-[#2e1065]'
                  : 'bg-[#1e1f25] hover:bg-[#292a2f] border-[#292a2f] text-[#e3e1e9]'
              }`}
              type="button"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f87171] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f87171]"></span>
              </span>
              <span className="font-mono text-xs font-medium">Stop generating</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                  theme === 'pastel'
                    ? 'bg-[#f3e8ff] text-[#6b21a8]'
                    : 'bg-[#34343a] text-[#bbcabf] group-hover:text-white'
                }`}
              >
                Esc
              </span>
            </button>
          </div>
        )}

        {/* Suggested Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {SUGGESTED_PROMPTS.map((item, index) => {
            const Icon = item.icon;
            const pastelClass = PASTEL_CHIP_STYLES[index % PASTEL_CHIP_STYLES.length];
            return (
              <button
                key={index}
                onClick={() => {
                  setInput(item.prompt);
                  textareaRef.current?.focus();
                }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-left shadow-xs cursor-pointer group border ${
                  theme === 'pastel'
                    ? pastelClass
                    : 'bg-[#1e1f25] hover:bg-[#292a2f] border-[#292a2f] hover:border-[#10b981]/50 text-[#bbcabf] hover:text-[#e3e1e9]'
                }`}
                type="button"
              >
                <Icon
                  className={`w-3.5 h-3.5 group-hover:scale-110 transition-transform ${
                    theme === 'pastel' ? 'opacity-85 text-[#7c3aed]' : item.color
                  }`}
                />
                <span className="text-xs font-medium">{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* High-Fidelity Main Composer Box */}
        <div
          className={`relative backdrop-blur-xl rounded-2xl shadow-xl p-3 flex flex-col gap-2 border transition-colors ${
            theme === 'pastel'
              ? 'bg-[#ffffff]/95 border-[#e9d5ff] text-[#2e1065] shadow-purple-200/50'
              : 'bg-[#1a1b21]/95 border-[#292a2f] text-[#e3e1e9]'
          }`}
        >
          {/* Image preview badge if uploaded */}
          {attachedImage && (
            <div
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border w-fit ${
                theme === 'pastel'
                  ? 'bg-[#f3e8ff] border-[#e9d5ff] text-[#2e1065]'
                  : 'bg-[#0d0e13] border-[#292a2f] text-[#e3e1e9]'
              }`}
            >
              <FileImage className="w-4 h-4 text-[#a855f7]" />
              <img
                src={attachedImage}
                alt="Upload preview"
                className="w-7 h-7 object-cover rounded"
              />
              <span className="text-xs">Image attached</span>
              <button
                onClick={() => setAttachedImage(null)}
                className="p-1 hover:text-rose-500 opacity-60 hover:opacity-100 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Input Textarea Row */}
          <div className="relative flex items-start gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Gemini anything... (Shift+Enter for new line)"
              rows={1}
              className={`w-full bg-transparent resize-none outline-none text-[15px] px-1 py-1 leading-relaxed ${
                theme === 'pastel'
                  ? 'text-[#2e1065] placeholder:text-[#8b799f]'
                  : 'text-[#e3e1e9] placeholder:text-[#86948a]'
              }`}
            />
            {input && (
              <button
                onClick={() => setInput('')}
                className={`p-1 rounded-lg opacity-60 hover:opacity-100 transition-colors ${
                  theme === 'pastel' ? 'hover:bg-[#f3e8ff] text-[#6b21a8]' : ''
                }`}
                title="Clear input"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Ribbon & Send Controls */}
          <div
            className={`flex items-center justify-between pt-1 border-t ${
              theme === 'pastel' ? 'border-[#e9d5ff]' : 'border-[#292a2f]/60'
            }`}
          >
            {/* Left Capabilities Ribbon */}
            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-1.5 rounded-lg transition-colors ${
                  theme === 'pastel'
                    ? 'text-[#6b21a8] hover:text-[#2e1065] hover:bg-[#f3e8ff]'
                    : 'text-[#86948a] hover:text-[#e3e1e9] hover:bg-[#1e1f25]'
                }`}
                title="Attach image for multimodal query"
                type="button"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Search Web grounding chip */}
              <button
                onClick={onToggleSearch}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all border ${
                  useSearch
                    ? theme === 'pastel'
                      ? 'bg-[#ede9fe] border-[#c084fc] text-[#6b21a8]'
                      : 'bg-[#06b6d4]/20 border-[#06b6d4]/50 text-[#4cd7f6]'
                    : theme === 'pastel'
                    ? 'bg-[#f5f0ff] hover:bg-[#ede9fe] border-[#e9d5ff] text-[#6b21a8]'
                    : 'bg-[#1e1f25] hover:bg-[#292a2f] border-[#292a2f] text-[#86948a]'
                }`}
                title="Enable Google Search Grounding for live web results"
                type="button"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Search Web</span>
              </button>

              {/* Code Exec chip */}
              <button
                onClick={onToggleCodeExec}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all border ${
                  codeExecMode
                    ? theme === 'pastel'
                      ? 'bg-[#f3e8ff] border-[#d8b4fe] text-[#7c3aed]'
                      : 'bg-[#10b981]/20 border-[#10b981]/50 text-[#4edea3]'
                    : theme === 'pastel'
                    ? 'bg-[#f5f0ff] hover:bg-[#ede9fe] border-[#e9d5ff] text-[#6b21a8]'
                    : 'bg-[#1e1f25] hover:bg-[#292a2f] border-[#292a2f] text-[#86948a]'
                }`}
                title="Code Execution / Developer Mode"
                type="button"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Exec</span>
              </button>

              {/* Voice Dictation */}
              <button
                onClick={toggleRecording}
                className={`p-1.5 rounded-lg transition-colors ${
                  isRecording
                    ? 'bg-[#f3e8ff] text-[#9333ea] animate-pulse border border-[#d8b4fe]'
                    : theme === 'pastel'
                    ? 'text-[#6b21a8] hover:text-[#2e1065] hover:bg-[#f3e8ff]'
                    : 'text-[#86948a] hover:text-[#e3e1e9] hover:bg-[#1e1f25]'
                }`}
                title={isRecording ? 'Listening... click to stop' : 'Voice dictation'}
                type="button"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Right: Model Label & Send / Stop Button */}
            <div className="flex items-center gap-2">
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-[11px] border ${
                  theme === 'pastel'
                    ? 'bg-[#f5f0ff] border-[#e9d5ff] text-[#6b21a8]'
                    : 'bg-[#0d0e13] border-[#292a2f] text-[#86948a]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    theme === 'pastel' ? 'bg-[#a855f7]' : 'bg-[#4edea3]'
                  }`}
                />
                {activeModel.replace('gemini-', '')}
              </span>

              {isGenerating ? (
                <button
                  onClick={onStopGenerating}
                  className="w-9 h-9 rounded-xl bg-[#fca5a5] text-[#7f1d1d] hover:bg-[#f87171] flex items-center justify-center transition-transform active:scale-95 shadow-md cursor-pointer"
                  title="Stop generating"
                  type="button"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim() && !attachedImage}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    input.trim() || attachedImage
                      ? theme === 'pastel'
                        ? 'bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] hover:from-[#9333ea] hover:to-[#7c3aed] text-white shadow-[0_4px_14px_rgba(168,85,247,0.4)] active:scale-95 cursor-pointer font-bold'
                        : 'bg-[#10b981] hover:bg-[#4edea3] text-[#003824] shadow-[0_0_16px_rgba(16,185,129,0.35)] active:scale-95 cursor-pointer font-bold'
                      : theme === 'pastel'
                      ? 'bg-[#ede9fe] text-[#8b799f] cursor-not-allowed opacity-60'
                      : 'bg-[#292a2f] text-[#86948a] cursor-not-allowed opacity-50'
                  }`}
                  title="Send message (Enter)"
                  type="button"
                >
                  <ArrowUp className="w-5 h-5 font-bold" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Micro-Caption Notice */}
        <div
          className={`flex items-center justify-between px-1 font-mono text-[11px] ${
            theme === 'pastel' ? 'text-[#8b799f]' : 'text-[#86948a]'
          }`}
        >
          <span>
            Gemini can make mistakes. Conversations are automatically synced to Browser LocalStorage. Free Tier API.
          </span>
          <span className="hidden md:inline-flex opacity-70">Pastel Purple Edition • UTF-8</span>
        </div>
      </div>
    </div>
  );
};
