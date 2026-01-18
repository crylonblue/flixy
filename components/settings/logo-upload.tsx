'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LoaderCircle, Upload, Trash2, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface LogoUploadProps {
  currentLogoUrl: string | null
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_DIMENSIONS = { width: 800, height: 400 }
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
const ACCEPTED_EXTENSIONS = '.png,.jpg,.jpeg,.svg,.webp'

/**
 * Process image client-side: convert to PNG, resize if needed
 */
async function processImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      // Calculate dimensions maintaining aspect ratio
      let { width, height } = img
      
      if (width > MAX_DIMENSIONS.width || height > MAX_DIMENSIONS.height) {
        const ratio = Math.min(
          MAX_DIMENSIONS.width / width,
          MAX_DIMENSIONS.height / height
        )
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      
      // Create canvas and draw image
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context nicht verfügbar'))
        return
      }
      
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to PNG blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Bildkonvertierung fehlgeschlagen'))
          }
        },
        'image/png',
        0.9
      )
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Bild konnte nicht geladen werden'))
    }
    
    img.src = url
  })
}

export default function LogoUpload({ currentLogoUrl }: LogoUploadProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl)

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Ungültiger Dateityp', {
        description: 'Erlaubt sind: PNG, JPG, SVG, WebP',
      })
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Datei zu groß', {
        description: 'Die maximale Dateigröße beträgt 5MB.',
      })
      return
    }

    setIsUploading(true)

    try {
      // Process image (convert/resize)
      const processedBlob = await processImage(file)
      
      // Create preview
      const previewObjectUrl = URL.createObjectURL(processedBlob)
      setPreviewUrl(previewObjectUrl)

      // Create form data
      const formData = new FormData()
      formData.append('logo', processedBlob, 'logo.png')

      // Upload to server
      const response = await fetch('/api/logo', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload fehlgeschlagen')
      }

      toast.success('Logo hochgeladen', {
        description: 'Das Logo wurde erfolgreich aktualisiert.',
      })
      
      // Update preview with actual URL
      setPreviewUrl(data.logo_url)
      
      // Refresh page to update state
      router.refresh()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Fehler beim Hochladen', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
      })
      // Revert preview on error
      setPreviewUrl(currentLogoUrl)
    } finally {
      setIsUploading(false)
    }
  }, [currentLogoUrl, router])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }, [handleFileSelect])

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch('/api/logo', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Löschen fehlgeschlagen')
      }

      toast.success('Logo entfernt', {
        description: 'Das Logo wurde erfolgreich entfernt.',
      })
      
      setPreviewUrl(null)
      setDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Fehler beim Löschen', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Preview / Upload Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${isDragging 
            ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-300 dark:bg-zinc-800' 
            : 'border-zinc-300 dark:border-zinc-700'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleInputChange}
          className="hidden"
        />
        
        {previewUrl ? (
          <div className="flex flex-col items-center gap-4">
            {/* Logo Preview */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Firmenlogo"
                className="max-h-24 max-w-[200px] object-contain"
              />
            </div>
            
            {/* Upload Instructions */}
            <div className="text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {isUploading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Wird hochgeladen...
                  </span>
                ) : (
                  'Klicken oder Datei hierher ziehen um zu ersetzen'
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            {isUploading ? (
              <LoaderCircle className="h-10 w-10 text-zinc-400 animate-spin" />
            ) : (
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                <Upload className="h-6 w-6 text-zinc-500" />
              </div>
            )}
            
            <div className="text-center">
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {isUploading ? 'Wird hochgeladen...' : 'Logo hochladen'}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-meta)' }}>
                PNG, JPG, SVG oder WebP (max. 5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Button */}
      {previewUrl && !isUploading && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setDeleteDialogOpen(true)
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Logo entfernen
          </Button>
        </div>
      )}

      {/* Hint about logo usage */}
      <p className="text-xs" style={{ color: 'var(--text-meta)' }}>
        Das Logo wird auf Ihren Rechnungen angezeigt, wenn Sie als Verkäufer auftreten.
      </p>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
        if (!isDeleting) setDeleteDialogOpen(open)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logo entfernen?</DialogTitle>
            <DialogDescription>
              Möchten Sie das Logo wirklich entfernen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
              Entfernen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
