"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon, FileText, CheckCircle } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"

interface FileUploadProps {
  onUploadComplete: (fileId: string) => void
  accept?: string
  maxSize?: number // in bytes
  className?: string
  label?: string
  description?: string
}

export function FileUpload({ 
  onUploadComplete, 
  accept = "*/*", 
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = "",
  label = "Upload File",
  description
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const saveFileId = useMutation(api.files.saveFileId)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`)
      return
    }

    // Check file type
    if (accept !== "*/*" && !file.type.match(accept.replace("*", ".*"))) {
      toast.error("Invalid file type")
      return
    }

    setIsUploading(true)

    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl()
      
      // Upload file to Convex
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })

      const { storageId } = await result.json()
      
      // Save file ID to database
      const fileId = await saveFileId({
        storageId,
        name: file.name,
        type: file.type,
        size: file.size,
      })

      setUploadedFile({
        name: file.name,
        url: URL.createObjectURL(file)
      })

      onUploadComplete(fileId)
      toast.success("File uploaded successfully")
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error("Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <ImageIcon className="h-4 w-4" />
    }
    
    return <FileText className="h-4 w-4" />
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      {description && (
        <p className="text-sm text-slate-500">{description}</p>
      )}
      
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6">
        {uploadedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getFileIcon(uploadedFile.name)}
              <span className="text-sm font-medium">{uploadedFile.name}</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-slate-400" />
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Choose File"}
              </Button>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              or drag and drop your file here
            </p>
            <p className="text-xs text-slate-400">
              Max size: {Math.round(maxSize / (1024 * 1024))}MB
            </p>
          </div>
        )}
      </div>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
