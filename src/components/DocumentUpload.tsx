// src/components/DocumentUpload.tsx
import React, { useState, useCallback } from 'react';
import { Upload, File, Link, Loader, CheckCircle, AlertCircle, X } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

interface DocumentUploadProps {
  onFileUpload: (files: File[]) => Promise<void>;
  onUrlUpload: (urls: string[]) => Promise<void>;
  isProcessing: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onFileUpload,
  onUrlUpload,
  isProcessing,
  maxFiles = 10,
  acceptedTypes = ['.pdf', '.docx', '.txt', '.md', '.html']
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [urls, setUrls] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadMode, setUploadMode] = useState<'files' | 'urls'>('files');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  }, []);

  const handleFileSelection = useCallback((files: File[]) => {
    if (files.length + uploadedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, [uploadedFiles.length, maxFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelection(Array.from(e.target.files));
    }
  }, [handleFileSelection]);

  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  const handleUploadFiles = useCallback(async () => {
    const pendingFiles = uploadedFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    // Update status to processing
    setUploadedFiles(prev => 
      prev.map(file => 
        file.status === 'pending' 
          ? { ...file, status: 'processing' as const }
          : file
      )
    );

    try {
      // Create File objects from the uploaded files
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      const files: File[] = [];
      
      fileInputs.forEach(input => {
        if (input.files) {
          files.push(...Array.from(input.files));
        }
      });

      await onFileUpload(files);

      // Update status to completed
      setUploadedFiles(prev => 
        prev.map(file => 
          file.status === 'processing' 
            ? { ...file, status: 'completed' as const }
            : file
        )
      );
    } catch (error) {
      // Update status to error
      setUploadedFiles(prev => 
        prev.map(file => 
          file.status === 'processing' 
            ? { ...file, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
            : file
        )
      );
    }
  }, [uploadedFiles, onFileUpload]);

  const handleUploadUrls = useCallback(async () => {
    const urlList = urls.split('\n').filter(url => url.trim());
    if (urlList.length === 0) return;

    try {
      await onUrlUpload(urlList);
      setUrls('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'URL upload failed');
    }
  }, [urls, onUrlUpload]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return <File className="w-4 h-4 text-gray-500" />;
      case 'processing':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Documents for Analysis
        </h2>
        <p className="text-gray-600">
          Upload research papers, reports, or documents to generate visualizations and insights
        </p>
      </div>

      {/* Upload Mode Toggle */}
      <div className="flex mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setUploadMode('files')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            uploadMode === 'files'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <File className="w-4 h-4 inline mr-2" />
          Upload Files
        </button>
        <button
          onClick={() => setUploadMode('urls')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            uploadMode === 'urls'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Link className="w-4 h-4 inline mr-2" />
          Add URLs
        </button>
      </div>

      {uploadMode === 'files' && (
        <div className="space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports: {acceptedTypes.join(', ')} • Max {maxFiles} files
            </p>
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Select Files
            </label>
          </div>

          {/* File List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
              <div className="space-y-2">
                {uploadedFiles.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(file.status)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                          {file.error && (
                            <span className="text-red-500 ml-2">• {file.error}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-gray-400 hover:text-red-500"
                      disabled={isProcessing}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUploadFiles}
                disabled={isProcessing || uploadedFiles.every(f => f.status !== 'pending')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin inline mr-2" />
                    Processing...
                  </>
                ) : (
                  'Process Documents'
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {uploadMode === 'urls' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter URLs (one per line)
            </label>
            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="https://example.com/research-paper.pdf&#10;https://example.com/document.html&#10;https://arxiv.org/abs/1234.5678"
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <button
            onClick={handleUploadUrls}
            disabled={isProcessing || !urls.trim()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader className="w-4 h-4 animate-spin inline mr-2" />
                Processing URLs...
              </>
            ) : (
              'Process URLs'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
