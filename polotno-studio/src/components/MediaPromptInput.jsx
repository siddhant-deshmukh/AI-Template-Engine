import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Search,
  Paperclip,
  Mic,
  ArrowUp,
  X,
  Image as ImageIcon,
  Video,
  Upload
} from 'lucide-react';

const MediaPromptInput = () => {
  const [prompt, setPrompt] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle file processing
  const processFiles = useCallback((files) => {
    const validFiles = Array.from(files).filter(file => {
      return file.type.startsWith('image/') || file.type.startsWith('video/');
    });

    const newMediaFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // Handle paste
  const handlePaste = useCallback((e) => {
    const items = e.clipboardData.items;
    const files = [];

    for (let item of items) {
      if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // Handle file input
  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    e.target.value = '';
  };

  // Remove media file
  const removeMediaFile = (id) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(file => file.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(file => file.id !== id);
    });
  };

  // Handle textarea resize
  const handleTextareaChange = (e) => {
    setPrompt(e.target.value);

    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 144); // Max 6 lines
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (prompt.trim() || mediaFiles.length > 0) {
      console.log('Prompt:', prompt);
      console.log('Media:', mediaFiles);
      // Add your submit logic here
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Media Preview */}
      {mediaFiles.length > 0 && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-300">Attached Media ({mediaFiles.length})</span>
          </div>
          <div className="flex gap-3 overflow-x-auto">
            {mediaFiles.map((media) => (
              <div key={media.id} className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700 border border-gray-600">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={media.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeMediaFile(media.id)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Container */}
      <div
        className={`
          relative bg-gray-800 rounded-2xl border-2 transition-all duration-200
          ${isDragOver
            ? 'border-blue-400 bg-gray-700'
            : 'border-gray-600 hover:border-gray-500'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500/10 rounded-2xl flex items-center justify-center z-10">
            <div className="text-blue-400 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Drop images or videos here</p>
            </div>
          </div>
        )}

        <div className="flex flex-col items-end p-4 gap-3">
          <div className="w-full  max-h-[154px] overflow-auto">
            <textarea
              ref={textareaRef}
              value={prompt}
              name="prompt"
              onChange={handleTextareaChange}
              onPaste={handlePaste}
              placeholder="Type What Kind of Canvas would you like to generate..."
              className="
                w-full bg-transparent text-gray-100 placeholder-gray-400 
                border-0 outline-0 resize-none 
                leading-6 focus:ring-0 focus:border-0 focus:outline-0
                scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent
                focus:shadow-none focus:ring-offset-0
              "
              style={{
                height: '24px',
                border: '0',
                outline: '0',
                boxShadow: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'textfield'
              }}
              rows={1}
            />
          </div>


          <div className='flex justify-between w-full'>
            {/* Left Icons */}
            <div className="flex items-center gap-2 pb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 w-8 p-0 text-gray-400 border border-gray-600 hover:text-gray-300 hover:bg-gray-700"
                title="Attach files"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2 pb-2">

              <Button
                onClick={handleSubmit}
                disabled={!prompt.trim() && mediaFiles.length === 0}
                size="sm"
                className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-600 disabled:text-gray-400"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Helper Text */}
      <div className="flex justify-between items-center mt-2 px-2 text-xs text-gray-200">
        <span>Supports images and videos • Copy/paste, drag & drop, or click attach</span>
      </div>
    </div>
  );
};

export default MediaPromptInput;
