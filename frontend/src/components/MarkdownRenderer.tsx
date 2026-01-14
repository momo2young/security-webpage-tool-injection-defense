import React from 'react';
import { marked } from 'marked';

// Configure marked to use Prism for code blocks could be nice, but for now let's just do basic html
// Note: MessageBubble might have already configured marked globally. 
// We should probably rely on the global config or re-configure safely.

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const htmlContent = marked.parse(content) as string;

    return (
        <div
            className="markdown-body text-sm"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
};
