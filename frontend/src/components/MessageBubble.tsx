import React from 'react';
import { Message } from '../types/api';
import { marked } from 'marked';

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className={message.role === 'user' ? 'text-right' : 'text-left'}>
      <div className={`inline-block max-w-3xl rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${message.role === 'user' ? 'bg-brand-600 text-white' : 'bg-neutral-800 text-neutral-100'} `}>
        <div dangerouslySetInnerHTML={{ __html: marked.parse(message.content) }} />
      </div>
    </div>
  );
};
