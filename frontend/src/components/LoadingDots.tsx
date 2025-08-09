import React from 'react';
export const LoadingDots: React.FC = () => (
  <span className="inline-flex gap-1">
    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-pulse" />
    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-pulse [animation-delay:150ms]" />
    <span className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-pulse [animation-delay:300ms]" />
  </span>
);
