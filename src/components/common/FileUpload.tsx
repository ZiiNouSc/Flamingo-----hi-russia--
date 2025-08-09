import React, { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { UploadedFile } from '../../types';

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  onFilesChange: (files: UploadedFile[]) => void;
  existingFiles?: UploadedFile[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = '.pdf,.png,.jpg,.jpeg',
  multiple = false,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
  onFilesChange,
  existingFiles = [],
}) => {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    processFiles(selectedFiles);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = (selectedFiles: FileList) => {
    setError(null);
    
    const newFiles: UploadedFile[] = [];
    const filesToProcess = Array.from(selectedFiles);
    
    // Check if adding these files would exceed the maxFiles limit
    if (multiple && files.length + filesToProcess.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }
    
    // Process each file
    filesToProcess.forEach(file => {
      // Check file size
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds the maximum size limit of ${maxSize / (1024 * 1024)}MB.`);
        return;
      }
      
      // Create a URL for preview (in a real app, this would be handled differently)
      const uploadedFile: UploadedFile & { file?: File } = {
        id: uuidv4(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        file,
      };
      
      newFiles.push(uploadedFile);
    });
    
    // Update state with new files
    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(file => file.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="form-group">
      <label className="label">{label}</label>
      
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-flamingo-400 bg-flamingo-50' 
            : 'border-gray-300 hover:border-flamingo-300 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center py-4">
          <Upload size={32} className="text-navy-400 mb-2" />
          <p className="text-navy-700 font-medium">
            Glissez-déposez {multiple ? 'des fichiers' : 'un fichier'} ici, ou cliquez pour parcourir
          </p>
          <p className="text-navy-500 text-sm mt-1">
            {multiple 
              ? `Téléchargez jusqu'à ${maxFiles} fichiers (max ${maxSize / (1024 * 1024)}Mo chacun)`
              : `Taille maximale : ${maxSize / (1024 * 1024)}Mo`}
          </p>
          <p className="text-navy-500 text-xs mt-1">
            Formats acceptés : {accept.replace(/\./g, '').replace(/,/g, ', ')}
          </p>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">{error}</div>
      )}
      
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-navy-700">Uploaded Files</h4>
          <ul className="space-y-2">
            {files.map(file => (
              <li 
                key={file.id} 
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <File size={20} className="text-navy-500 flex-shrink-0" />
                  <div className="ml-2 flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-700 truncate">{file.name}</p>
                    <p className="text-xs text-navy-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="ml-2 text-navy-500 hover:text-red-500 transition-colors p-1"
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;