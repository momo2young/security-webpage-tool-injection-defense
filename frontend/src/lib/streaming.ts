import { ChatConfig } from '../types/api';
import { useChatStore } from '../hooks/useChatStore'; // (Note: runtime import not used directly here, but kept for context)

// Streaming implementation mirroring logic from Streamlit app.py
// Maintains content blocks (markdown/code) toggled by CODE_TAG sentinel.

export interface StreamCallbacks {
  onDelta: (delta: string) => void;            // incremental markdown delta appended to current assistant message
  onAction?: () => void;                       // plan refresh trigger
  onNewAssistantMessage?: () => void;          // create a new assistant message container (step split)
}

interface ContentBlock { type: 'markdown' | 'code'; content: string }

function assembleForStorage(blocks: ContentBlock[]): string {
  return blocks.map(b => b.type === 'markdown' ? b.content : `\n\n\
\n${b.content}\n\n\
\n`).join('');
}

function getStepFootnote(step: any, stepName: string): string {
  let foot = `**${stepName}**`;
  if (step?.token_usage) {
    const inp = step.token_usage.input_tokens?.toLocaleString?.() ?? step.token_usage.input_tokens;
    const outp = step.token_usage.output_tokens?.toLocaleString?.() ?? step.token_usage.output_tokens;
    foot += ` | Input tokens: ${inp} | Output tokens: ${outp}`;
  }
  const dur = step?.timing?.duration;
  if (dur) {
    const dNum = parseFloat(dur);
    if (!Number.isNaN(dNum)) foot += ` | Duration: ${dNum.toFixed(2)}s`;
  }
  return `<span style="color:#bbbbc2;font-size:12px;">${foot}</span>\n\n`;
}

export async function streamChat(prompt: string, config: ChatConfig, callbacks: StreamCallbacks, codeTag = '<code>') {
  const { onDelta, onAction, onNewAssistantMessage } = callbacks;
  const res = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: prompt, config }),
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.body) return;

  // State for current assistant message
  let blocks: ContentBlock[] = [{ type: 'markdown', content: '' }];
  let isInCodeBlock = false;
  let assembledLen = 0;

  const emitDiff = () => {
    const assembled = assembleForStorage(blocks);
    if (assembled.length > assembledLen) {
      const delta = assembled.slice(assembledLen);
      assembledLen = assembled.length;
      onDelta(delta);
    }
  };

  const resetForNewAssistantMessage = () => {
    blocks = [{ type: 'markdown', content: '' }];
    isInCodeBlock = false;
    assembledLen = 0;
    if (onNewAssistantMessage) onNewAssistantMessage();
  };

  // Start first assistant message container
  if (onNewAssistantMessage) onNewAssistantMessage();

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      if (!line.startsWith('data:')) continue;
      const jsonStr = line.slice(5).trim();
      let obj: any;
      try { obj = JSON.parse(jsonStr); } catch { continue; }
      const type = obj.type;
      const data = obj.data;

      if (type === 'stream_delta') {
        const content: string = data?.content || '';
        if (!content) continue;
        let remaining = content;
        while (remaining.includes(codeTag)) {
          const idx = remaining.indexOf(codeTag);
          const before = remaining.slice(0, idx);
          const after = remaining.slice(idx + codeTag.length);
          if (before) blocks[blocks.length - 1].content += before;
          if (isInCodeBlock) {
            blocks.push({ type: 'markdown', content: '' });
            isInCodeBlock = false;
          } else {
            blocks.push({ type: 'code', content: '' });
            isInCodeBlock = true;
          }
          remaining = after;
        }
        if (remaining) blocks[blocks.length - 1].content += remaining;
        emitDiff();
      } else if (type === 'final_answer') {
        if (isInCodeBlock) { blocks.push({ type: 'markdown', content: '' }); isInCodeBlock = false; }
        blocks[blocks.length - 1].content += `\n\n${data}`;
        emitDiff();
        // Final answer ends this assistant message
      } else if (type === 'action') {
        if (onAction) onAction();
        if (isInCodeBlock) { blocks.push({ type: 'markdown', content: '' }); isInCodeBlock = false; }
        let actionMarkdown = '';
        let observations: string | undefined = data?.observations;
        if (observations && !data?.is_final_answer) {
          observations = observations.replace(/^Execution logs:\s*/i, '').trim();
          const split = observations.split(/Last output from code snippet:\s*/i);
          observations = split[0].trimEnd();
          actionMarkdown += `\n\n<details><summary>📝 Execution Logs</summary>\n\n${observations}\n\n</details>`;
        }
        const stepName = `Step: ${data?.step_number}`;
        actionMarkdown += getStepFootnote(data, stepName);
        blocks[blocks.length - 1].content += actionMarkdown;
        emitDiff();
        // Start a new assistant message for next step output
        resetForNewAssistantMessage();
      } else if (type === 'error') {
        if (isInCodeBlock) { blocks.push({ type: 'markdown', content: '' }); isInCodeBlock = false; }
        blocks[blocks.length - 1].content += `\n\n**Error:** ${data}`;
        emitDiff();
        resetForNewAssistantMessage();
      }
    }
  }
}
