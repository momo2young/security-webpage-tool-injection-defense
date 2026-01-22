import React from 'react';
import { BrutalSelect } from './BrutalSelect';
import { ConfigOptions, ChatConfig } from '../types/api';
import { FileIcon } from './FileIcon';
import { PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ChatInputPanelProps {
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    selectedFiles: File[];
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeFile: (index: number) => void;
    uploadProgress?: number;
    isUploading?: boolean;
    fileError?: string | null;
    send: () => void;
    isStreaming: boolean;
    config: ChatConfig;
    setConfig: React.Dispatch<React.SetStateAction<ChatConfig>>;
    backendConfig: ConfigOptions | null;
    fileInputRef: React.RefObject<HTMLInputElement>;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    configReady: boolean;
    streamingForCurrentChat: boolean;
    stopStreaming?: () => void; // Optional because only used in footer sometimes
    stopInFlight?: boolean;
    modelSelectDropUp?: boolean;
    onPaste?: (files: File[]) => void;
    onImageClick?: (src: string) => void;
}

export const ChatInputPanel: React.FC<ChatInputPanelProps> = ({
    input,
    setInput,
    selectedFiles,
    handleFileSelect,
    removeFile,
    uploadProgress = 0,
    isUploading = false,
    fileError = null,
    send,
    isStreaming,
    config,
    setConfig,
    backendConfig,
    fileInputRef,
    textareaRef,
    configReady,
    streamingForCurrentChat,
    stopStreaming,
    stopInFlight = false,
    modelSelectDropUp = true,
    onPaste,
    onImageClick,
}) => {
    return (
        <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="bg-neutral-50 border-2 border-brutal-black shadow-brutal-sm p-2 flex flex-col gap-2 relative group focus-within:shadow-brutal focus-within:-translate-y-[1px] transition-all duration-200"
        >
            {/* Unified file preview section */}
            {selectedFiles.length > 0 && (
                <div className="flex flex-col gap-2 p-2 mb-1">
                    {selectedFiles.map((file, idx) => {
                        const isImage = file.type.startsWith('image/');

                        return (
                            <div key={idx}>
                                {isImage ? (
                                    // Image preview (larger, visual)
                                    <div className="relative group/image inline-block">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-20 h-20 object-cover border-3 border-brutal-black cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => onImageClick?.(URL.createObjectURL(file))}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-brutal-red border-2 border-brutal-black text-white text-sm flex items-center justify-center font-bold shadow-brutal-sm hover:shadow-none transition-all"
                                            title="Remove file"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    // File card (icon + name + size)
                                    <div className="flex items-center gap-2 bg-white border-2 border-brutal-black p-2">
                                        <FileIcon mimeType={file.type} className="w-5 h-5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-brutal-black truncate">{file.name}</div>
                                            <div className="text-xs text-neutral-500">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx)}
                                            className="shrink-0 w-6 h-6 bg-brutal-red border-2 border-brutal-black text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                            title="Remove file"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload progress bar */}
            {isUploading && (
                <div className="p-2">
                    <div className="w-full bg-neutral-200 border-2 border-brutal-black h-6 overflow-hidden">
                        <div
                            className="h-full bg-brutal-blue transition-all duration-300 flex items-center justify-center"
                            style={{ width: `${uploadProgress}%` }}
                        >
                            <span className="text-xs font-bold text-white">{uploadProgress.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Error message */}
            {fileError && (
                <div className="p-2">
                    <div className="bg-brutal-red border-2 border-brutal-black p-2 text-white text-sm font-bold">
                        {fileError}
                    </div>
                </div>
            )}

            < textarea
                autoFocus
                ref={textareaRef}
                className="w-full resize-none overflow-y-auto min-h-[44px] max-h-[200px] bg-transparent focus:outline-none text-lg text-brutal-black placeholder-neutral-400 font-medium placeholder:font-bold border-none p-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!isStreaming && configReady && input.trim()) {
                            send();
                        }
                    }
                }}
                placeholder={configReady ? 'How can I help you today?' : 'SYSTEM LOADING...'}
                disabled={!configReady}
                onPaste={(e) => {
                    if (onPaste && e.clipboardData) {
                        // Method 1: Get files directly (works for all file types pasted)
                        const files = Array.from(e.clipboardData.files || []);

                        // Method 2: Fallback to items for screenshot/image data
                        if (files.length === 0) {
                            const items = Array.from(e.clipboardData.items);
                            items.forEach(item => {
                                if (item.kind === 'file') {
                                    const file = item.getAsFile();
                                    if (file) {
                                        files.push(file);
                                    }
                                }
                            });
                        }

                        if (files.length > 0) {
                            onPaste(files);
                        }
                    }
                }}
            />

            {/* Button row */}
            <div className="flex flex-wrap gap-2 items-center justify-between pt-1">
                <div className="flex gap-4 items-center pl-2 shrink-0">
                    {/* Unified file input (all types) */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-brutal-black hover:text-brutal-blue transition-colors disabled:opacity-40"
                        title="Attach files (images, PDFs, documents, etc.)"
                        disabled={!configReady || isStreaming || isUploading}
                    >
                        <PaperClipIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 items-center justify-end flex-1 min-w-0">
                    <div className="text-[10px] text-brutal-black font-mono font-bold select-none uppercase opacity-50 hidden sm:block whitespace-nowrap mr-2">
                        ↵ SEND • ⇧↵ NEW LINE
                    </div>

                    {stopStreaming && streamingForCurrentChat && (
                        <button
                            type="button"
                            onClick={stopStreaming}
                            className="h-10 bg-brutal-red border-2 border-brutal-black shadow-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 px-4 text-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed text-white uppercase shrink-0"
                            disabled={stopInFlight}
                        >
                            STOP
                        </button>
                    )}

                    {configReady && (
                        <div className="relative shrink-0 max-w-[120px] sm:max-w-none">
                            <BrutalSelect
                                value={config.model}
                                onChange={(val) => setConfig(prev => ({ ...prev, model: val }))}
                                options={backendConfig!.models}
                                placeholder="MODEL"
                                dropUp={modelSelectDropUp}
                                className="h-10 text-sm w-full sm:min-w-[120px]"
                                dropdownClassName="min-w-[200px] right-0"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="h-9 bg-brutal-blue border-2 border-brutal-black shadow-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 px-4 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed text-white uppercase ml-1 shrink-0"
                        disabled={isStreaming || !configReady}
                        title="Send Message"
                    >
                        {streamingForCurrentChat ? 'SENDING...' : 'SEND'}
                    </button>
                </div>
            </div>
        </form>
    );
};
