'use client'

import { useState } from 'react'
import { IssuerSnapshot, Company } from '@/types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIssuerDrawer } from '@/contexts/issuer-drawer-context'
import IssuerDrawer from './issuer-drawer'

interface IssuerSelectorProps {
  company: Company | null
  selectedIssuer: IssuerSnapshot | null
  useDefault: boolean
  onSelect: (issuer: IssuerSnapshot | null, useDefault: boolean) => void
}

export default function IssuerSelector({
  company,
  selectedIssuer,
  useDefault,
  onSelect,
}: IssuerSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { openDrawer } = useIssuerDrawer()

  const options = [
    {
      id: 'default',
      name: company?.name || 'Standard',
      description: 'Firmendaten aus Einstellungen',
    },
    {
      id: 'custom',
      name: 'Benutzerdefiniert',
      description: selectedIssuer && !useDefault ? selectedIssuer.name : 'Neuen Absender erstellen',
    },
  ]

  const handleSelect = (optionId: string) => {
    if (optionId === 'default') {
      onSelect(null, true)
      setOpen(false)
    } else {
      // If custom issuer already exists, use it, otherwise open drawer
      if (selectedIssuer && !useDefault) {
        onSelect(selectedIssuer, false)
        setOpen(false)
      } else {
        // Open drawer for custom issuer
        setOpen(false)
        openDrawer()
      }
    }
  }

  const handleNewIssuerSelect = (issuer: IssuerSnapshot) => {
    onSelect(issuer, false)
  }

  const displayValue = useDefault 
    ? (company?.name || 'Standard')
    : selectedIssuer 
      ? selectedIssuer.name 
      : 'Absender auswählen...'

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {displayValue}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command className="flex flex-col">
            <CommandInput
              placeholder="Absender suchen..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList className="flex-1 max-h-[200px] overflow-y-auto">
              <CommandEmpty>
                Kein Absender gefunden.
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = (option.id === 'default' && useDefault) || 
                                    (option.id === 'custom' && !useDefault && selectedIssuer)
                  return (
                    <CommandItem
                      key={option.id}
                      value={option.name}
                      onSelect={() => handleSelect(option.id)}
                      style={{
                        backgroundColor: isSelected ? 'rgba(45, 45, 45, 0.08)' : 'transparent',
                        transition: 'background-color 0.2s ease, color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'rgba(45, 45, 45, 0.04)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span style={{ color: isSelected ? 'var(--text-primary)' : undefined }}>
                          {option.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
            <div className="border-t p-1 flex-shrink-0" style={{ borderColor: 'rgb(var(--input))' }}>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false)
                  openDrawer()
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Benutzerdefinierten Absender erstellen
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      <IssuerDrawer 
        defaultIssuer={selectedIssuer || undefined}
        onSelect={handleNewIssuerSelect} 
      />
    </>
  )
}

