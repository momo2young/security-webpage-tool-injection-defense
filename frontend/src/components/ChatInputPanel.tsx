import React from 'react';
import { BrutalSelect } from './BrutalSelect';
import { ConfigOptions, ChatConfig } from '../types/api';

interface ChatInputPanelProps {
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    selectedImages: File[];
    handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeImage: (index: number) => void;
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
    onPasteImages?: (files: File[]) => void;
    onImageClick?: (src: string) => void;
}

export const ChatInputPanel: React.FC<ChatInputPanelProps> = ({
    input,
    setInput,
    selectedImages,
    handleImageSelect,
    removeImage,
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
    onPasteImages,
    onImageClick,
}) => {
    return (
        <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="bg-neutral-50 border-2 border-brutal-black shadow-brutal-sm p-2 flex flex-col gap-2 relative group focus-within:shadow-brutal focus-within:-translate-y-[1px] transition-all duration-200"
        >
            {/* Image preview section */}
            {selectedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 mb-1">
                    {selectedImages.map((file, idx) => (
                        <div key={idx} className="relative group/image">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-20 h-20 object-cover border-3 border-brutal-black cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => onImageClick?.(URL.createObjectURL(file))}
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-brutal-red border-2 border-brutal-black text-white text-sm flex items-center justify-center font-bold shadow-brutal-sm hover:shadow-none transition-all"
                                title="Remove image"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )
            }

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
                    if (onPasteImages && e.clipboardData && e.clipboardData.items) {
                        const items = Array.from(e.clipboardData.items);
                        const imageFiles: File[] = [];

                        items.forEach(item => {
                            if (item.type.startsWith('image/')) {
                                const file = item.getAsFile();
                                if (file) {
                                    imageFiles.push(file);
                                }
                            }
                        });

                        if (imageFiles.length > 0) {
                            // Don't prevent default if we want text to still paste?
                            // Actually if we are pasting images we probably don't want the filename text inserted if the browser does that,
                            // but browsers usually don't insert text for image paste unless it's a file path text.
                            // However, we might rely on the image being handled separately.
                            // If we prevent default, text pasting won't work if mixed.

                            // Better approach: only prevent default if we ONLY found images and NO text?
                            // Or just add images and let text paste proceed.
                            onPasteImages(imageFiles);
                        }
                    }
                }}
            />

            {/* Button row */}
            <div className="flex flex-wrap gap-2 items-center justify-between pt-1">
                <div className="flex gap-4 items-center pl-2 shrink-0">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-brutal-black hover:text-brutal-blue transition-colors disabled:opacity-40"
                        title="Attach images"
                        disabled={!configReady || isStreaming}
                    >
                        <svg className="w-6 h-6" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="8" y1="2" x2="8" y2="14" />
                            <line x1="2" y1="8" x2="14" y2="8" />
                        </svg>
                    </button>
                    {/* Removed Clock Icon as requested */}
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
