import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split content by $$ for display math and $ for inline math
  const renderFormattedText = (text: string) => {
    // First, split by block math $$...$$
    const blockParts = text.split(/(\$\$[\s\S]*?\$\$)/g);

    return blockParts.map((blockPart, bIdx) => {
      if (blockPart.startsWith('$$') && blockPart.endsWith('$$')) {
        const math = blockPart.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <div
              key={`block-${bIdx}`}
              className="my-3 overflow-x-auto py-1 text-center font-serif text-indigo-200"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <pre key={`err-block-${bIdx}`} className="text-amber-400 font-mono text-sm">
              {blockPart}
            </pre>
          );
        }
      }

      // Inside regular text or inline, split by single $...$
      // We also handle escaped dollars or regular lines
      const inlineParts = blockPart.split(/(\$[^\$\n]+?\$)/g);

      return (
        <span key={`text-${bIdx}`}>
          {inlineParts.map((part, iIdx) => {
            if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
              const inlineMath = part.slice(1, -1);
              try {
                const html = katex.renderToString(inlineMath, {
                  displayMode: false,
                  throwOnError: false,
                });
                return (
                  <span
                    key={`inline-${bIdx}-${iIdx}`}
                    className="inline-block px-1 font-serif text-indigo-300 align-baseline"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              } catch {
                return (
                  <span key={`err-inline-${bIdx}-${iIdx}`} className="text-amber-300 font-mono text-xs">
                    {part}
                  </span>
                );
              }
            }

            // Normal text: handle line breaks and bold/bullets formatting simply
            return (
              <span key={`inline-txt-${bIdx}-${iIdx}`} className="whitespace-pre-wrap">
                {part}
              </span>
            );
          })}
        </span>
      );
    });
  };

  return <div className={`math-content leading-relaxed text-slate-200 ${className}`}>{renderFormattedText(content)}</div>;
};
