import { useState, useRef, useCallback } from 'react';
import { FileAttachment, ImageAttachment } from '../types/api';
import { API_BASE } from '../lib/api';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB per file
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100 MB total

interface UploadResult {
  fileMetadata: FileAttachment[];
  imagePreviews: ImageAttachment[];
}

export function useUnifiedFileUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounterRef = useRef(0);

  const validateFiles = useCallback((files: File[]): { valid: File[]; error?: string } => {
    const validFiles: File[] = [];
    let totalSize = 0;

    for (const file of files) {
      // Check individual file size
      if (file.size > MAX_FILE_SIZE) {
        return { valid: [], error: `File "${file.name}" exceeds 50 MB limit` };
      }

      totalSize += file.size;

      // Check total size
      if (totalSize > MAX_TOTAL_SIZE) {
        return { valid: [], error: 'Total file size exceeds 100 MB limit' };
      }

      validFiles.push(file);
    }

    return { valid: validFiles };
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const { valid, error: validationError } = validateFiles(files);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFiles(prev => [...prev, ...valid]);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [validateFiles]);

  const handlePaste = useCallback((files: File[]) => {
    const { valid, error: validationError } = validateFiles(files);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (valid.length > 0) {
      setSelectedFiles(prev => [...prev, ...valid]);
      setError(null);
    }
  }, [validateFiles]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setError(null);
  }, []);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
    setError(null);
    setUploadProgress(0);
    // Reset drag state as safety measure
    dragCounterRef.current = 0;
    setIsDragging(false);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.types.includes('Files')) {
      dragCounterRef.current += 1;
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Reset drag state
    dragCounterRef.current = 0;
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const { valid, error: validationError } = validateFiles(files);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (valid.length > 0) {
      setSelectedFiles(prev => [...prev, ...valid]);
      setError(null);
    }
  }, [validateFiles]);

  // Convert images to base64 for preview
  const convertImagesToBase64 = useCallback(async (images: File[]): Promise<ImageAttachment[]> => {
    const promises = images.map(file => {
      return new Promise<ImageAttachment>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const base64Data = dataUrl.split(',')[1];
          resolve({
            id: crypto.randomUUID(),
            data: base64Data,
            mime_type: file.type,
            filename: file.name
          });
        };
        reader.readAsDataURL(file);
      });
    });
    return Promise.all(promises);
  }, []);

  // Upload all files to server and generate image previews
  const uploadFiles = useCallback(async (files: File[], chatId: string): Promise<UploadResult> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Upload ALL files to server
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const fileMetadata = await new Promise<FileAttachment[]>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              setUploadProgress(100);
              resolve(response.files);
            } catch (err) {
              reject(new Error('Failed to parse upload response'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed due to network error'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was cancelled'));
        });

        xhr.open('POST', `${API_BASE}/sandbox/upload?chat_id=${chatId}`);
        xhr.send(formData);
      });

      // Step 2: For images, ALSO convert to base64 for preview
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      const imagePreviews = imageFiles.length > 0
        ? await convertImagesToBase64(imageFiles)
        : [];

      return { fileMetadata, imagePreviews };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [convertImagesToBase64]);

  return {
    selectedFiles,
    setSelectedFiles,
    isDragging,
    uploadProgress,
    isUploading,
    error,
    fileInputRef,
    handleFileSelect,
    handlePaste,
    removeFile,
    clearFiles,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    uploadFiles,
  };
}
