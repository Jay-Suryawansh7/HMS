import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export function PhotoUpload({ onChange, error }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        alert('Only JPG and PNG images are allowed');
        return;
      }

      onChange(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024
  });

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <div className="space-y-2">
      {!preview ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary",
            error && "border-red-500"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-sm text-primary">Drop the image here...</p>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Drag & drop patient photo here, or click to select
              </p>
              <p className="text-xs text-gray-400">
                JPG or PNG, max 5MB
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Patient preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
