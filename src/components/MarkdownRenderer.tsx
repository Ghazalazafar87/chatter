import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
  showLineNumbers?: boolean;
}

// Simple syntax colorizer for keywords, strings, comments, types
function highlightCode(rawCode: string, lang: string): React.ReactNode[] {
  const lines = rawCode.split('\n');

  return lines.map((line, idx) => {
    // Quick regex highlighting for JS/TS/Python/CSS/JSON
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let keyCounter = 0;

    // Check for comment
    const commentIndex = remaining.search(/\/\/|#|\/\*/);
    let codePart = remaining;
    let commentPart = '';

    if (commentIndex !== -1 && !remaining.includes('http://') && !remaining.includes('https://')) {
      codePart = remaining.slice(0, commentIndex);
      commentPart = remaining.slice(commentIndex);
    }

    // Split codePart by tokens
    const regex =
      /('(?:\\.|[^'])*'|"(?:\\.|[^"])*"|`(?:\\.|[^`])*`|\b(?:import|from|export|default|function|const|let|var|return|async|await|try|catch|if|else|for|while|new|class|interface|type|extends|implements|public|private|static|true|false|null|undefined|void|boolean|string|number|any)\b|[{}()[\].,;:+\-*/%=<>!&|?]+|[a-zA-Z_$][a-zA-Z0-9_$]*|\s+)/g;

    let match;
    let lastIndex = 0;

    while ((match = regex.exec(codePart)) !== null) {
      const matchText = match[0];
      const matchStart = match.index;

      if (matchStart > lastIndex) {
        tokens.push(
          <span key={keyCounter++} className="text-[#e3e1e9]">
            {codePart.substring(lastIndex, matchStart)}
          </span>
        );
      }

      if (/^['"`]/.test(matchText)) {
        // String literal
        tokens.push(
          <span key={keyCounter++} className="text-[#4edea3]">
            {matchText}
          </span>
        );
      } else if (
        /^(import|from|export|default|function|const|let|var|return|async|await|try|catch|if|else|for|while|new|class|interface|type|extends|implements)$/.test(
          matchText
        )
      ) {
        // Keyword
        tokens.push(
          <span key={keyCounter++} className="text-[#4cd7f6] font-medium">
            {matchText}
          </span>
        );
      } else if (/^(true|false|null|undefined|boolean|string|number|any|void)$/.test(matchText)) {
        // Type / Built-in
        tokens.push(
          <span key={keyCounter++} className="text-[#c0c1ff]">
            {matchText}
          </span>
        );
      } else if (/^[{}()[\].,;:+\-*/%=<>!&|?]+$/.test(matchText)) {
        // Operator / Punctuation
        tokens.push(
          <span key={keyCounter++} className="text-[#86948a]">
            {matchText}
          </span>
        );
      } else {
        // Identifier / function name / whitespace
        const isPascal = /^[A-Z][a-zA-Z0-9]*$/.test(matchText);
        tokens.push(
          <span key={keyCounter++} className={isPascal ? 'text-[#a7f3d0]' : 'text-[#e3e1e9]'}>
            {matchText}
          </span>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < codePart.length) {
      tokens.push(
        <span key={keyCounter++} className="text-[#e3e1e9]">
          {codePart.substring(lastIndex)}
        </span>
      );
    }

    if (commentPart) {
      tokens.push(
        <span key={keyCounter++} className="text-[#86948a] italic">
          {commentPart}
        </span>
      );
    }

    return (
      <div key={idx} className="table-row leading-relaxed font-mono">
        <span className="table-cell select-none text-right pr-4 text-[#86948a]/50 text-xs w-8">
          {String(idx + 1).padStart(2, '0')}
        </span>
        <span className="table-cell pl-2 whitespace-pre">{tokens.length > 0 ? tokens : ' '}</span>
      </div>
    );
  });
}

function CodeBlock({
  code,
  language,
  showLineNumbers = true,
}: {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Guess filename or display language
  let displayTitle = language || 'code';
  if (language.includes('.')) {
    displayTitle = language;
  } else if (language === 'ts' || language === 'typescript') {
    displayTitle = 'TypeScript';
  } else if (language === 'tsx') {
    displayTitle = 'React (TSX)';
  } else if (language === 'jsx' || language === 'javascript' || language === 'js') {
    displayTitle = 'JavaScript';
  } else if (language === 'css') {
    displayTitle = 'CSS';
  } else if (language === 'json') {
    displayTitle = 'JSON';
  } else if (language === 'bash' || language === 'sh') {
    displayTitle = 'Shell';
  }

  return (
    <div className="w-full my-3.5 rounded-xl bg-[#0d0e13] border border-[#292a2f] overflow-hidden shadow-2xl">
      {/* Code Block Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#1a1b21] border-b border-[#292a2f]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#34343a]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]/80"></span>
          </div>
          <span className="text-xs text-[#bbcabf] font-mono ml-2 font-medium">{displayTitle}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#292a2f] hover:bg-[#34343a] text-[#bbcabf] hover:text-[#e3e1e9] text-xs font-medium transition-all"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#4edea3]" />
              <span className="text-[#4edea3]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-3.5 overflow-x-auto text-[13px] leading-relaxed font-mono">
        <div className="table w-full">{highlightCode(code.trim(), language)}</div>
      </div>
    </div>
  );
}

// Formats inline text with bold, italic, inline code, and links
function formatInlineText(text: string): React.ReactNode {
  // Split by inline code first: `code`
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inlineCode = part.slice(1, -1);
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[var(--bg-surface-high)] text-[var(--accent-primary)] font-mono text-[13px] font-medium border border-[var(--border-color)]"
        >
          {inlineCode}
        </code>
      );
    }

    // Process bold (**bold**) and italics (*italic*)
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {boldParts.map((bPart, j) => {
          if (bPart.startsWith('**') && bPart.endsWith('**')) {
            return (
              <strong key={j} className="text-[var(--text-primary)] font-semibold">
                {bPart.slice(2, -2)}
              </strong>
            );
          }
          // Process markdown links [text](url)
          const linkParts = bPart.split(/(\[[^\]]+\]\([^)]+\))/g);
          return linkParts.map((lPart, k) => {
            const linkMatch = lPart.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (linkMatch) {
              return (
                <a
                  key={k}
                  href={linkMatch[2]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent-primary)] hover:underline font-medium"
                >
                  {linkMatch[1]}
                </a>
              );
            }
            return lPart;
          });
        })}
      </span>
    );
  });
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isStreaming = false,
  showLineNumbers = true,
}) => {
  // Parse code blocks vs regular markdown blocks
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_.-]*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      parts.push(renderTextMarkdown(textBefore, `text-${lastIndex}`));
    }

    const language = match[1] || 'text';
    const code = match[2];
    parts.push(
      <CodeBlock
        key={`code-${match.index}`}
        code={code}
        language={language}
        showLineNumbers={showLineNumbers}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    parts.push(renderTextMarkdown(remainingText, `text-${lastIndex}`));
  }

  function renderTextMarkdown(rawText: string, keyPrefix: string): React.ReactNode {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flushList = (idx: number) => {
      if (!currentList) return;
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`${keyPrefix}-list-${idx}`} className="list-disc pl-5 my-2 space-y-1 text-[var(--text-primary)]">
            {currentList.items.map((it, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed">
                {formatInlineText(it)}
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`${keyPrefix}-list-${idx}`} className="list-decimal pl-5 my-2 space-y-1 text-[var(--text-primary)]">
            {currentList.items.map((it, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed">
                {formatInlineText(it)}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Heading 1 (# ...)
      if (trimmed.startsWith('# ')) {
        flushList(index);
        elements.push(
          <h1 key={`${keyPrefix}-h1-${index}`} className="text-xl font-bold text-[var(--text-primary)] mt-4 mb-2">
            {formatInlineText(trimmed.slice(2))}
          </h1>
        );
        return;
      }

      // Heading 2 (## ...)
      if (trimmed.startsWith('## ')) {
        flushList(index);
        elements.push(
          <h2 key={`${keyPrefix}-h2-${index}`} className="text-lg font-bold text-[var(--text-primary)] mt-3.5 mb-2">
            {formatInlineText(trimmed.slice(3))}
          </h2>
        );
        return;
      }

      // Heading 3 (### ...)
      if (trimmed.startsWith('### ')) {
        flushList(index);
        elements.push(
          <h3 key={`${keyPrefix}-h3-${index}`} className="text-base font-semibold text-[var(--accent-primary)] mt-3 mb-1.5">
            {formatInlineText(trimmed.slice(4))}
          </h3>
        );
        return;
      }

      // Blockquote (> ...)
      if (trimmed.startsWith('> ')) {
        flushList(index);
        elements.push(
          <blockquote
            key={`${keyPrefix}-quote-${index}`}
            className="border-l-3 border-[var(--accent-primary)] pl-3.5 py-1.5 my-2 text-[var(--text-secondary)] bg-[var(--bg-surface-low)] rounded-r-lg italic"
          >
            {formatInlineText(trimmed.slice(2))}
          </blockquote>
        );
        return;
      }

      // Unordered list item (- ... or * ...)
      if (/^[-*]\s+/.test(trimmed)) {
        const itemContent = trimmed.replace(/^[-*]\s+/, '');
        if (!currentList || currentList.type !== 'ul') {
          flushList(index);
          currentList = { type: 'ul', items: [itemContent] };
        } else {
          currentList.items.push(itemContent);
        }
        return;
      }

      // Ordered list item (1. ...)
      if (/^\d+\.\s+/.test(trimmed)) {
        const itemContent = trimmed.replace(/^\d+\.\s+/, '');
        if (!currentList || currentList.type !== 'ol') {
          flushList(index);
          currentList = { type: 'ol', items: [itemContent] };
        } else {
          currentList.items.push(itemContent);
        }
        return;
      }

      // Empty line / paragraph break
      if (!trimmed) {
        flushList(index);
        return;
      }

      // Regular paragraph
      flushList(index);
      elements.push(
        <p key={`${keyPrefix}-p-${index}`} className="my-1.5 leading-relaxed text-[var(--text-primary)]">
          {formatInlineText(line)}
        </p>
      );
    });

    flushList(lines.length);

    return <div key={keyPrefix}>{elements}</div>;
  }

  return (
    <div className="text-[15px] leading-relaxed text-[var(--text-primary)] font-sans break-words space-y-2">
      {parts}
      {isStreaming && (
        <span
          className="inline-block w-2 h-4 bg-[var(--accent-primary)] align-middle ml-1 animate-pulse rounded-[1px]"
          title="Streaming response..."
        />
      )}
    </div>
  );
};
