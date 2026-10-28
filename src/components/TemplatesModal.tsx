import React from 'react';
import { PromptTemplate } from '../types/chat';
import { X, Sparkles, Code2, Cpu, Wrench, FileCode, Lightbulb, ArrowRight } from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: PromptTemplate, startNewChat: boolean) => void;
  theme?: 'pastel' | 'dark' | 'light';
}

const TEMPLATES: PromptTemplate[] = [
  {
    id: 'tmpl-architect',
    title: 'Full-Stack Next.js & Node Architect',
    category: 'Architecture',
    description: 'Design production-grade API routes, data validation schemas, and state synchronization pipelines.',
    prompt: 'I need to architect a robust, production-ready full-stack application using Next.js App Router, Tailwind CSS, and streaming endpoints. Please outline the directory layout, request-response contracts, error boundaries, and optimistic caching strategy.',
    systemInstruction: 'You are a principal cloud architect specializing in Next.js, Node.js, and modern distributed frontend architecture.',
    icon: 'Cpu',
  },
  {
    id: 'tmpl-reviewer',
    title: 'Code Reviewer & Bug Hunter',
    category: 'Debugging',
    description: 'Audit code for edge cases, memory leaks, security vulnerabilities, and typing pitfalls.',
    prompt: 'Please perform a thorough code review on the following snippet. Highlight security flaws, unhandled exceptions, race conditions, and recommend idiomatic TypeScript refactors with explanations.',
    systemInstruction: 'You are a rigorous senior code reviewer focusing on correctness, security, performance, and maintainability.',
    icon: 'Wrench',
  },
  {
    id: 'tmpl-hydration',
    title: 'TypeScript Hydration Bug Specialist',
    category: 'Debugging',
    description: 'Resolve React 19 / Next.js hydration mismatches, window/document access bugs, and SSR state diffs.',
    prompt: 'I am experiencing a React hydration mismatch error: "Text content does not match server-rendered HTML". How do I isolate whether it is caused by browser extensions, date/time formatting, or localStorage access during initial render?',
    systemInstruction: 'You are an expert in React reconciliation, Next.js SSR lifecycles, and client-server state hydration.',
    icon: 'FileCode',
  },
  {
    id: 'tmpl-algorithm',
    title: 'Algorithm & Data Structure Optimizer',
    category: 'Coding',
    description: 'Optimize computational time and space complexity with clean Big-O analysis and benchmarks.',
    prompt: 'Given an array of objects representing chat messages with timestamps and role tags, show me how to implement an indexed sliding window algorithm in TypeScript with O(log n) search and O(1) retrieval.',
    systemInstruction: 'You are an algorithms researcher who explains time and space complexity clearly with executable code examples.',
    icon: 'Code2',
  },
  {
    id: 'tmpl-brainstorm',
    title: 'Product Feature & UX Ideator',
    category: 'Reasoning',
    description: 'Brainstorm innovative features, UX flows, and keyboard accessibility shortcuts for web tools.',
    prompt: 'Brainstorm 5 high-impact, delightful micro-interactions for a developer-centric AI chat tool (e.g. keyboard command bar, diff viewers, token telemetry, responsive drawers).',
    systemInstruction: 'You are a product designer and developer advocate focused on delightful software craft and ergonomic user experience.',
    icon: 'Lightbulb',
  },
];

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  theme = 'pastel',
}) => {
  if (!isOpen) return null;

  const isPastel = theme === 'pastel';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
          isPastel
            ? 'bg-[#ffffff] border-[#e9d5ff] text-[#2e1065]'
            : 'bg-[#1a1b21] border-[#292a2f] text-[#e3e1e9]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isPastel ? 'border-[#e9d5ff]' : 'border-[#292a2f]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                isPastel
                  ? 'bg-[#f3e8ff] border-[#d8b4fe] text-[#7c3aed]'
                  : 'bg-[#10b981]/15 border-[#10b981]/30 text-[#4edea3]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Prompt Templates Gallery</h2>
              <p className={`text-xs ${isPastel ? 'text-[#8b799f]' : 'text-[#86948a]'}`}>
                Curated workflows engineered for technical precision
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isPastel
                ? 'text-[#8b799f] hover:text-[#2e1065] hover:bg-[#f3e8ff]'
                : 'text-[#86948a] hover:text-[#e3e1e9] hover:bg-[#292a2f]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Feed */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className={`p-4 border rounded-xl transition-all group flex flex-col gap-2.5 ${
                isPastel
                  ? 'bg-[#f5f0ff] border-[#e9d5ff] hover:border-[#a855f7]'
                  : 'bg-[#1e1f25] border-[#292a2f] hover:border-[#10b981]/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      isPastel ? 'bg-[#ede9fe] text-[#7c3aed]' : 'bg-[#292a2f] text-[#4edea3]'
                    }`}
                  >
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-semibold transition-colors ${
                        isPastel
                          ? 'text-[#2e1065] group-hover:text-[#7c3aed]'
                          : 'text-[#e3e1e9] group-hover:text-[#4edea3]'
                      }`}
                    >
                      {tmpl.title}
                    </h3>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 border font-mono text-[10px] rounded ${
                        isPastel
                          ? 'bg-[#ffffff] border-[#e9d5ff] text-[#6b21a8]'
                          : 'bg-[#0d0e13] border-[#292a2f] text-[#86948a]'
                      }`}
                    >
                      {tmpl.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onApplyTemplate(tmpl, false);
                      onClose();
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isPastel
                        ? 'bg-[#ffffff] hover:bg-[#ede9fe] text-[#2e1065] border border-[#e9d5ff]'
                        : 'bg-[#292a2f] hover:bg-[#34343a] text-[#e3e1e9]'
                    }`}
                  >
                    Insert Prompt
                  </button>
                  <button
                    onClick={() => {
                      onApplyTemplate(tmpl, true);
                      onClose();
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shadow-xs ${
                      isPastel
                        ? 'bg-[#a855f7] hover:bg-[#9333ea] text-white'
                        : 'bg-[#10b981] hover:bg-[#4edea3] text-[#003824]'
                    }`}
                  >
                    <span>New Chat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isPastel ? 'text-[#6b5d7d]' : 'text-[#bbcabf]'}`}>
                {tmpl.description}
              </p>

              <div
                className={`p-2.5 rounded-lg border text-xs font-mono line-clamp-2 ${
                  isPastel
                    ? 'bg-[#ffffff] border-[#e9d5ff] text-[#6b21a8]'
                    : 'bg-[#0d0e13] border-[#292a2f]/60 text-[#86948a]'
                }`}
              >
                "{tmpl.prompt}"
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
