
import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Upload, Paperclip, Send, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { DragDropProvider } from "@/components/DragDropProvider"

interface UploadedFile {
  id: string
  file: File
  preview: string
  type: "image" | "video"
  uploadProgress?: number
}

export default function PromptChatInput() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [message, setMessage] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messageAreaRef = useRef<HTMLDivElement>(null)

  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  const MAX_FILES = 10

  const isValidFileType = (file: File): boolean => {
    return file.type.startsWith("image/") || file.type.startsWith("video/")
  }

  const isValidFileSize = (file: File): boolean => {
    return file.size <= MAX_FILE_SIZE
  }

  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error("Failed to read image file"))
        reader.readAsDataURL(file)
      } else if (file.type.startsWith("video/")) {
        const video = document.createElement("video")
        video.preload = "metadata"
        video.onloadedmetadata = () => {
          video.currentTime = 1
        }
        video.onseeked = () => {
          try {
            const canvas = document.createElement("canvas")
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext("2d")
            ctx?.drawImage(video, 0, 0)
            resolve(canvas.toDataURL())
          } catch (error) {
            reject(new Error("Failed to generate video thumbnail"))
          }
        }
        video.onerror = () => reject(new Error("Failed to load video"))
        video.src = URL.createObjectURL(file)
      }
    })
  }

  const addFiles = useCallback(
    async (newFiles: File[]) => {
      setError(null)
      setIsProcessing(true)

      // Validation
      if (files.length + newFiles.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed. You can upload ${MAX_FILES - files.length} more files.`)
        setIsProcessing(false)
        return
      }

      const validFiles = newFiles.filter((file) => {
        if (!isValidFileType(file)) return false
        if (!isValidFileSize(file)) {
          setError(`File "${file.name}" is too large. Maximum size is 50MB.`)
          return false
        }
        return true
      })

      const invalidTypeFiles = newFiles.filter((file) => !isValidFileType(file))

      if (invalidTypeFiles.length > 0) {
        setError(`${invalidTypeFiles.length} file(s) rejected. Only images and videos are allowed.`)
      }

      if (validFiles.length === 0) {
        setIsProcessing(false)
        return
      }

      const uploadedFiles: UploadedFile[] = []

      for (const [_, file] of validFiles.entries()) {
        try {
          // Simulate upload progress
          const fileWithProgress: UploadedFile = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: "",
            type: file.type.startsWith("image/") ? "image" : "video",
            uploadProgress: 0,
          }

          uploadedFiles.push(fileWithProgress)

          // Add file immediately with 0 progress
          setFiles((prev) => [...prev, fileWithProgress])

          // Simulate progress updates
          for (let progress = 0; progress <= 100; progress += 20) {
            await new Promise((resolve) => setTimeout(resolve, 100))
            setFiles((prev) => prev.map((f) => (f.id === fileWithProgress.id ? { ...f, uploadProgress: progress } : f)))
          }

          // Generate preview
          const preview = await createFilePreview(file)
          setFiles((prev) =>
            prev.map((f) => (f.id === fileWithProgress.id ? { ...f, preview, uploadProgress: undefined } : f)),
          )
        } catch (error) {
          console.error("Error processing file:", file.name, error)
          setFiles((prev) => prev.filter((f) => f.id !== uploadedFiles[uploadedFiles.length - 1]?.id))
          setError(`Failed to process "${file.name}". Please try again.`)
        }
      }

      setIsProcessing(false)
    },
    [files.length],
  )

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const reorderFiles = (startIndex: number, endIndex: number) => {
    setFiles((prev) => {
      const result = Array.from(prev)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    })
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    addFiles(selectedFiles)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const hasFiles = e.dataTransfer.items && Array.from(e.dataTransfer.items).some((item) => item.kind === "file")
    if (hasFiles) {
      e.dataTransfer.dropEffect = "copy"
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const files = items
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null)

    if (files.length > 0) {
      addFiles(files)
    }
  }

  const handleSend = () => {
    if (!message.trim() && files.length === 0) return

    // Mock send functionality
    console.log("Sending message:", message)
    console.log("Sending files:", files)

    // Reset form
    setMessage("")
    setFiles([])
    setError(null)

    // Focus back to textarea
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === "Escape") {
      setError(null)
    }
  }

  useEffect(() => {

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault()
    }

    document.addEventListener("dragover", handleGlobalDragOver)
    document.addEventListener("drop", handleGlobalDrop)

    return () => {
      document.removeEventListener("dragover", handleGlobalDragOver)
      document.removeEventListener("drop", handleGlobalDrop)
    }
  }, [])

  const totalFileSize = files.reduce((total, file) => total + file.file.size, 0)
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <TooltipProvider>
      <DragDropProvider onReorder={reorderFiles}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header with improved accessibility */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">AI Template Generator</h1>
            <p className="text-muted-foreground">
              Write prompt add images to get printable banner design for Social Media Post, Thumbnail • Max {MAX_FILES}{" "}
              files, 50MB each
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>
                {files.length}/{MAX_FILES} files
              </span>
              {totalFileSize > 0 && <span>Total: {formatFileSize(totalFileSize)}</span>}
            </div>
          </div>

          {/* Enhanced Error Message */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5 animate-in slide-in-from-top-2 duration-300">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setError(null)}
                    className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                  >
                    ×
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="relative">
            <CardContent className="p-0">
              <div
                ref={messageAreaRef}
                className={cn(
                  "relative rounded-lg transition-all duration-300",
                  isDragOver && "bg-accent/5 ring-2 ring-accent ring-offset-2",
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={isProcessing || files.length >= MAX_FILES}
                  aria-label="Upload files"
                />

                {/* File previews inside textarea area */}
                {files.length > 0 && (
                  <div className="p-4 pb-2 border-b border-border/50">
                    <div className="flex flex-wrap gap-2">
                      {files.map((file) => (
                        <div key={file.id} className="relative">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/50 bg-muted/50">
                            {file.preview ? (
                              file.type === "image" ? (
                                <img
                                  src={file.preview || "/placeholder.svg"}
                                  alt={file.file.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <div className="w-6 h-6 bg-accent/20 rounded flex items-center justify-center">
                                    <div className="w-3 h-3 bg-accent rounded-sm"></div>
                                  </div>
                                </div>
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <LoadingSpinner size="sm" />
                              </div>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => removeFile(file.id)}
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs"
                          >
                            ×
                          </Button>
                          {file.uploadProgress !== undefined && (
                            <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
                              <div className="text-xs font-medium">{file.uploadProgress}%</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Textarea with integrated drop zone */}
                <div className="relative p-4">
                  <Textarea
                    ref={textareaRef}
                    placeholder={
                      files.length === 0
                        ? "Write prompt add images to get printable banner design for Social Media Post, Thumbnail... (Drop files here or Cmd/Ctrl + Enter to send)"
                        : "Write your prompt... (Cmd/Ctrl + Enter to send)"
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      "min-h-[120px] resize-none border-0 shadow-none focus-visible:ring-0 text-base leading-relaxed bg-transparent",
                      isDragOver && "pointer-events-none",
                    )}
                    aria-label="Message input"
                  />

                  {/* Drop overlay */}
                  {isDragOver && (
                    <div className="absolute inset-4 bg-accent/10 border-2 border-accent border-dashed rounded-lg flex items-center justify-center animate-in fade-in duration-200 z-10">
                      <div className="text-center space-y-2">
                        <Upload className="w-6 h-6 text-accent mx-auto" />
                        <p className="text-accent font-medium text-sm">Drop files here</p>
                      </div>
                    </div>
                  )}

                  {/* Bottom toolbar */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isProcessing || files.length >= MAX_FILES}
                            className="h-8 w-8"
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Attach files</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <div className="flex items-center gap-2">
                      {files.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {files.length} file{files.length > 1 ? "s" : ""}
                        </span>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            onClick={handleSend}
                            disabled={!message.trim() && files.length === 0}
                            className="h-8 w-8"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Send message (Cmd/Ctrl + Enter)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DragDropProvider>
    </TooltipProvider>
  )
}

