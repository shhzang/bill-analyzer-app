import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'pdf' | 'excel' | 'image' | 'unknown';
}

interface FileUploadZoneProps {
  onFilesSelected: (files: UploadedFile[]) => void;
  isLoading?: boolean;
}

const ACCEPTED_TYPES = {
  pdf: ['application/pdf'],
  excel: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
};

const ACCEPTED_EXTENSIONS = ['.pdf', '.xls', '.xlsx', '.csv', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

export default function FileUploadZone({ onFilesSelected, isLoading = false }: FileUploadZoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): UploadedFile['type'] => {
    if (ACCEPTED_TYPES.pdf.includes(file.type)) return 'pdf';
    if (ACCEPTED_TYPES.excel.includes(file.type)) return 'excel';
    if (ACCEPTED_TYPES.image.includes(file.type)) return 'image';
    return 'unknown';
  };

  const processFiles = useCallback((files: FileList) => {
    const newFiles: UploadedFile[] = [];
    const imagesToProcess: UploadedFile[] = [];
    let processedCount = 0;

    Array.from(files).forEach((file) => {
      const fileType = getFileType(file);
      
      // Validate file type
      if (fileType === 'unknown') {
        toast.error(`Unsupported file type: ${file.name}`);
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max 50MB)`);
        return;
      }

      const uploadedFile: UploadedFile = {
        file,
        type: fileType,
      };

      // Create preview for images
      if (fileType === 'image') {
        imagesToProcess.push(uploadedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
          processedCount++;
          
          // When all images are processed, update state
          if (processedCount === imagesToProcess.length) {
            setUploadedFiles((prev) => {
              const updated = [...prev, ...newFiles, ...imagesToProcess];
              onFilesSelected(updated);
              return updated;
            });
          }
        };
        reader.onerror = () => {
          toast.error(`Failed to read image: ${file.name}`);
          processedCount++;
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push(uploadedFile);
      }
    });

    // If there are no images, update immediately
    if (imagesToProcess.length === 0) {
      setUploadedFiles((prev) => {
        const updated = [...prev, ...newFiles];
        onFilesSelected(updated);
        return updated;
      });
    }
  }, [onFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const getFileIcon = (type: UploadedFile['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-400" />;
      case 'excel':
        return <File className="w-6 h-6 text-green-400" />;
      case 'image':
        return <Image className="w-6 h-6 text-blue-400" />;
      default:
        return <File className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-neon-pink bg-[#ff006e]/10 scale-105'
            : 'border-neon-cyan bg-[#00f5ff]/5 hover:border-neon-pink hover:bg-[#ff006e]/5'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Neon glow effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isLoading}
        />

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="p-3 bg-neon-cyan/10 rounded-lg">
            <Upload className="w-8 h-8 text-neon-cyan" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-semibold text-neon-cyan glow-text-cyan">
              Drag & Drop Your Files Here
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              or click to browse
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Supported: PDF, Excel (XLS, XLSX, CSV), Images (JPG, PNG, etc.) • Max 50MB per file
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neon-pink glow-text">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {uploadedFiles.map((uploadedFile, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-[#1a1a2e] border border-neon-cyan/30 rounded-lg hover:border-neon-pink/50 transition-colors duration-200"
              >
                {uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center bg-[#0a0e27] rounded">
                    {getFileIcon(uploadedFile.type)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-300 truncate font-mono">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadedFile.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="p-1 hover:bg-neon-pink/20 rounded transition-colors duration-200 text-gray-400 hover:text-neon-pink"
                  disabled={isLoading}
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {uploadedFiles.length > 0 && (
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => {
              setUploadedFiles([]);
              onFilesSelected([]);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            variant="outline"
            className="flex-1 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
            disabled={isLoading}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
