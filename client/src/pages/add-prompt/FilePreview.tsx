import { type FC } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview: FC<FilePreviewProps> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith('image/');
  const fileUrl = isImage ? URL.createObjectURL(file) : null;

  return (
    <div className="relative flex items-center p-2 rounded-lg bg-gray-800 border border-gray-700">
      {isImage ? (
        <img src={fileUrl || ''} alt={file.name} className="h-16 w-16 object-cover rounded-md" />
      ) : (
        <div className="h-16 w-16 flex items-center justify-center text-sm text-gray-400 truncate">
          {file.name}
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
        aria-label="Remove file"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default FilePreview;