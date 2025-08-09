import React, { useEffect } from 'react';
import Prism from 'prismjs';

export const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language = 'python' }) => {
  useEffect(() => { Prism.highlightAll(); }, [code]);
  return (
    <pre className={`language-${language} text-xs`}><code className={`language-${language}`}>{code}</code></pre>
  );
};
