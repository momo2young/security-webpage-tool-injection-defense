import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FilePreview } from './sidebar/FilePreview';
import { isBinaryServedFile } from '../lib/fileUtils';

interface FileViewerProps {
    filePath: string | null;
    fileName: string | null;
    chatId: string | null;
    onClose: () => void;
}

export const FileViewer: React.FC<FileViewerProps> = ({ filePath, fileName, chatId, onClose }) => {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (filePath) {
            window.addEventListener('keydown', handleKeyDown);
            fetchFileContent();
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [filePath, onClose]);

    const fetchFileContent = async () => {
        if (!filePath || !chatId) return;

        setLoading(true);
        setError(null);
        setFileContent(null);

        try {
            // Skip content fetching for binary/served files
            if (fileName && isBinaryServedFile(fileName)) {
                // These files are served directly via iframe/img in FilePreview
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/sandbox/read_file?chat_id=${chatId}&path=${encodeURIComponent(filePath)}`);
            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setFileContent(data.content);
            }
        } catch (err) {
            setError("Failed to fetch file content");
        } finally {
            setLoading(false);
        }
    };

    if (!filePath || !chatId) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-brutal-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-6xl h-[90vh] bg-white border-4 border-brutal-black shadow-brutal-xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b-4 border-brutal-black bg-brutal-yellow shrink-0">
                    <h2 className="text-lg font-bold text-brutal-black truncate font-mono uppercase tracking-wider">
                        {fileName || 'File Preview'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-brutal-red border-2 border-brutal-black text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all shadow-brutal"
                        title="Close (Esc)"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-white">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin w-12 h-12 border-4 border-brutal-black border-t-neutral-400 rounded-full"></div>
                        </div>
                    ) : error ? (
                        <div className="p-8 m-8 bg-brutal-red/10 border-3 border-brutal-red text-brutal-red text-sm font-bold font-mono">
                            ERROR: {error}
                        </div>
                    ) : (
                        <FilePreview
                            filename={fileName || 'file'}
                            content={fileContent}
                            chatId={chatId}
                            path={filePath}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
