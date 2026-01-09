'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ApiKey } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoaderCircle, Plus, Copy, Trash2, RotateCw, Check } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface ApiKeysSectionProps {
  companyId: string
}

export default function ApiKeysSection({ companyId }: ApiKeysSectionProps) {
  const supabase = createClient()
  const [apiKey, setApiKey] = useState<ApiKey | null>(null)
  const [fullApiKey, setFullApiKey] = useState<string | null>(null) // Store full key only when just created
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadApiKey()
  }, [companyId])

  const loadApiKey = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      toast.error('Fehler beim Laden des API-Keys', {
        description: error.message,
      })
    } else {
      setApiKey(data)
    }
    setIsLoading(false)
  }

  const generateApiKey = (): string => {
    // Generate a secure random API key
    const prefix = 'flx_'
    const randomBytes = new Uint8Array(32)
    crypto.getRandomValues(randomBytes)
    const key = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return `${prefix}${key}`
  }

  const hashApiKey = async (key: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(key)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleCreateApiKey = async () => {
    setIsCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Benutzer nicht gefunden')
        setIsCreating(false)
        return
      }

      const apiKeyValue = generateApiKey()
      const keyHash = await hashApiKey(apiKeyValue)
      const keyPrefix = apiKeyValue.substring(0, 12)

      const { error } = await supabase
        .from('api_keys')
        .insert({
          company_id: companyId,
          user_id: user.id,
          key_hash: keyHash,
          key_prefix: keyPrefix,
        })

      if (error) {
        toast.error('Fehler beim Erstellen des API-Keys', {
          description: error.message,
        })
        setIsCreating(false)
        return
      }

      setFullApiKey(apiKeyValue)
      await loadApiKey()

      toast.success('API-Key erstellt', {
        description: 'Bitte kopieren Sie den Key jetzt, er wird nicht erneut angezeigt.',
      })
    } catch (err) {
      toast.error('Fehler beim Erstellen des API-Keys', {
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleRotateApiKey = async () => {
    if (!apiKey) return

    setIsRotating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Benutzer nicht gefunden')
        setIsRotating(false)
        return
      }

      // Delete old key
      const { error: deleteError } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', apiKey.id)

      if (deleteError) {
        toast.error('Fehler beim Rotieren des API-Keys', {
          description: deleteError.message,
        })
        setIsRotating(false)
        return
      }

      // Create new key
      const apiKeyValue = generateApiKey()
      const keyHash = await hashApiKey(apiKeyValue)
      const keyPrefix = apiKeyValue.substring(0, 12)

      const { error: insertError } = await supabase
        .from('api_keys')
        .insert({
          company_id: companyId,
          user_id: user.id,
          key_hash: keyHash,
          key_prefix: keyPrefix,
        })

      if (insertError) {
        toast.error('Fehler beim Rotieren des API-Keys', {
          description: insertError.message,
        })
        setIsRotating(false)
        return
      }

      setFullApiKey(apiKeyValue)
      await loadApiKey()

      toast.success('API-Key rotiert', {
        description: 'Ein neuer Key wurde erstellt. Bitte kopieren Sie ihn jetzt.',
      })
    } catch (err) {
      toast.error('Fehler beim Rotieren des API-Keys', {
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
      })
    } finally {
      setIsRotating(false)
    }
  }

  const handleDeleteApiKey = async () => {
    if (!apiKey) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', apiKey.id)

      if (error) {
        toast.error('Fehler beim Löschen des API-Keys', {
          description: error.message,
        })
      } else {
        toast.success('API-Key gelöscht', {
          description: 'Der API-Key wurde erfolgreich gelöscht.',
        })
        setApiKey(null)
        setFullApiKey(null)
      }
    } catch (err) {
      toast.error('Fehler beim Löschen des API-Keys', {
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('In Zwischenablage kopiert')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Fehler beim Kopieren')
    }
  }

  const displayKey = fullApiKey || (apiKey ? `${apiKey.key_prefix}••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••` : null)

  return (
    <>
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          API-Key
        </CardTitle>
        <CardDescription className="text-sm">
          Erstellen Sie einen API-Key für den programmatischen Zugriff auf Ihre Daten. Sie können nur einen Key haben.
        </CardDescription>
      </CardHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoaderCircle className="h-6 w-6 animate-spin" style={{ color: 'var(--text-secondary)' }} />
        </div>
      ) : !apiKey ? (
        <div className="space-y-4">
          <div className="text-center py-8">
            <p className="text-secondary mb-4">Noch kein API-Key vorhanden</p>
            <Button onClick={handleCreateApiKey} disabled={isCreating}>
              {isCreating ? (
                <>
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  Erstelle...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  API-Key erstellen
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* API Key Display */}
          {fullApiKey && (
            <div className="p-4 rounded-lg border-2" style={{ borderColor: 'rgb(34, 197, 94)', backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    {apiKey ? 'Neuer API-Key erstellt' : 'API-Key rotiert'}
                  </h3>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Bitte kopieren Sie diesen Key jetzt. Er wird nicht erneut angezeigt.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 rounded bg-white dark:bg-zinc-900 border text-sm font-mono break-all" style={{ borderColor: 'var(--border-default)' }}>
                      {fullApiKey}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(fullApiKey)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFullApiKey(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}

          {/* Existing Key Display */}
          {!fullApiKey && (
            <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-default)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      Ihr API-Key
                    </span>
                  </div>
                  <code className="text-sm font-mono break-all" style={{ color: 'var(--text-secondary)' }}>
                    {displayKey}
                  </code>
                  <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'var(--text-meta)' }}>
                    <span>Erstellt: {format(new Date(apiKey.created_at), 'd. MMM yyyy', { locale: de })}</span>
                    {apiKey.last_used_at && (
                      <span>Zuletzt verwendet: {format(new Date(apiKey.last_used_at), 'd. MMM yyyy', { locale: de })}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {fullApiKey && (
              <Button
                variant="outline"
                onClick={() => copyToClipboard(fullApiKey)}
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Kopiert!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Kopieren
                  </>
                )}
              </Button>
            )}
            {!fullApiKey && (
              <>
                <Button
                  variant="outline"
                  onClick={handleRotateApiKey}
                  disabled={isRotating || isDeleting}
                  className="flex-1"
                >
                  {isRotating ? (
                    <>
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                      Rotiere...
                    </>
                  ) : (
                    <>
                      <RotateCw className="h-4 w-4 mr-2" />
                      Rotieren
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isRotating || isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                      Lösche...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API-Key löschen?</DialogTitle>
            <DialogDescription>
              Möchten Sie Ihren API-Key wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
              Alle Anwendungen, die diesen Key verwenden, verlieren den Zugriff.
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
              variant="destructive"
              onClick={handleDeleteApiKey}
              disabled={isDeleting}
            >
              {isDeleting && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
