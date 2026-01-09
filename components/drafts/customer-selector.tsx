'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CustomerSnapshot, Customer } from '@/types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCustomerDrawer } from '@/contexts/customer-drawer-context'
import CustomerDrawer from './customer-drawer'

interface CustomerSelectorProps {
  companyId: string
  selectedCustomer: CustomerSnapshot | null
  onSelect: (customer: CustomerSnapshot) => void
}

export default function CustomerSelector({
  companyId,
  selectedCustomer,
  onSelect,
}: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { openDrawer } = useCustomerDrawer()
  const supabase = createClient()

  useEffect(() => {
    loadCustomers()
  }, [companyId])

  const loadCustomers = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', companyId)
      .order('name')

    if (data) {
      setCustomers(data)
    }
    setIsLoading(false)
  }

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectCustomer = (customer: Customer) => {
    const snapshot: CustomerSnapshot = {
      id: customer.id,
      name: customer.name,
      address: customer.address as any,
      email: customer.email || undefined,
      vat_id: customer.vat_id || undefined,
    }
    onSelect(snapshot)
    setOpen(false)
    setSearchQuery('')
  }

  const handleNewCustomerSelect = (snapshot: CustomerSnapshot) => {
    onSelect(snapshot)
    // Reload customers to include the new one
    loadCustomers()
  }

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
            {selectedCustomer ? selectedCustomer.name : 'Kunde auswählen...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command className="flex flex-col">
            <CommandInput
              placeholder="Kunde suchen..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList className="flex-1 max-h-[200px] overflow-y-auto">
              <CommandEmpty>
                {isLoading ? 'Lädt...' : 'Kein Kunde gefunden.'}
              </CommandEmpty>
              <CommandGroup>
                {filteredCustomers.map((customer) => {
                  const isSelected = selectedCustomer?.id === customer.id
                  return (
                    <CommandItem
                      key={customer.id}
                      value={customer.name}
                      onSelect={() => handleSelectCustomer(customer)}
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
                          {customer.name}
                        </span>
                        {customer.address && (
                          <span className="text-xs text-muted-foreground">
                            {(customer.address as any).city}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
            <div className="border-t border-zinc-200 dark:border-zinc-700 p-1 flex-shrink-0">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false)
                  openDrawer()
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Neuen Kunden hinzufügen
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      <CustomerDrawer companyId={companyId} onSelect={handleNewCustomerSelect} />
    </>
  )
}
