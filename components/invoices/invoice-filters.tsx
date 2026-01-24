"use client"

import * as React from "react"
import { useState, useMemo, useCallback, useEffect } from "react"
import { Search, X, ChevronDown, Calendar, Euro, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ToggleButton } from "@/components/ui/toggle-button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Invoice } from "@/types"
import { isOverdue } from "@/lib/invoice-utils"

// Status configuration with colors
const STATUS_CONFIG = {
  created: { label: "Erstellt", colorClass: "bg-blue-500" },
  sent: { label: "Versendet", colorClass: "bg-amber-500" },
  reminded: { label: "Gemahnt", colorClass: "bg-orange-500" },
  paid: { label: "Bezahlt", colorClass: "bg-emerald-500" },
  cancelled: { label: "Storniert", colorClass: "bg-neutral-500" },
} as const

type InvoiceStatus = keyof typeof STATUS_CONFIG

// Time period presets
const TIME_PERIODS = [
  { id: "all", label: "Alle" },
  { id: "this_month", label: "Dieser Monat" },
  { id: "last_month", label: "Letzter Monat" },
  { id: "this_quarter", label: "Dieses Quartal" },
  { id: "last_quarter", label: "Letztes Quartal" },
  { id: "this_year", label: "Dieses Jahr" },
  { id: "custom", label: "Benutzerdefiniert" },
] as const

type TimePeriod = (typeof TIME_PERIODS)[number]["id"]

export interface InvoiceFilters {
  search: string
  statuses: Set<InvoiceStatus>
  showOverdue: boolean
  timePeriod: TimePeriod
  dateFrom: string | null
  dateTo: string | null
  amountMin: string
  amountMax: string
}

const DEFAULT_FILTERS: InvoiceFilters = {
  search: "",
  statuses: new Set(["created", "sent", "reminded", "paid", "cancelled"]),
  showOverdue: false,
  timePeriod: "all",
  dateFrom: null,
  dateTo: null,
  amountMin: "",
  amountMax: "",
}

interface InvoiceFiltersProps {
  invoices: Invoice[]
  onFilteredInvoicesChange: (filtered: Invoice[]) => void
  companyNames?: Record<string, string>
}

export function InvoiceFiltersToolbar({
  invoices,
  onFilteredInvoicesChange,
  companyNames = {},
}: InvoiceFiltersProps) {
  const [filters, setFilters] = useState<InvoiceFilters>(DEFAULT_FILTERS)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [amountPopoverOpen, setAmountPopoverOpen] = useState(false)

  // Calculate date ranges for time periods
  const getDateRange = useCallback((period: TimePeriod): { from: Date | null; to: Date | null } => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    
    switch (period) {
      case "this_month":
        return {
          from: new Date(year, month, 1),
          to: new Date(year, month + 1, 0),
        }
      case "last_month":
        return {
          from: new Date(year, month - 1, 1),
          to: new Date(year, month, 0),
        }
      case "this_quarter": {
        const quarterStart = Math.floor(month / 3) * 3
        return {
          from: new Date(year, quarterStart, 1),
          to: new Date(year, quarterStart + 3, 0),
        }
      }
      case "last_quarter": {
        const currentQuarterStart = Math.floor(month / 3) * 3
        const lastQuarterStart = currentQuarterStart - 3
        const lastQuarterYear = lastQuarterStart < 0 ? year - 1 : year
        const adjustedStart = lastQuarterStart < 0 ? lastQuarterStart + 12 : lastQuarterStart
        return {
          from: new Date(lastQuarterYear, adjustedStart, 1),
          to: new Date(lastQuarterYear, adjustedStart + 3, 0),
        }
      }
      case "this_year":
        return {
          from: new Date(year, 0, 1),
          to: new Date(year, 11, 31),
        }
      default:
        return { from: null, to: null }
    }
  }, [])

  // Filter invoices based on all criteria
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Status filter
      if (!filters.statuses.has(invoice.status as InvoiceStatus)) {
        return false
      }

      // Overdue filter (only show overdue if enabled)
      if (filters.showOverdue && !isOverdue(invoice)) {
        return false
      }

      // Search filter
      if (filters.search.trim()) {
        const searchLower = filters.search.toLowerCase()
        const buyerSnapshot = invoice.buyer_snapshot as any
        const buyerName = invoice.buyer_is_self
          ? (companyNames[invoice.company_id] || "")
          : (buyerSnapshot?.name || "")
        
        const searchableFields = [
          invoice.invoice_number,
          buyerName,
          invoice.total_amount?.toString(),
        ].filter(Boolean)

        const matches = searchableFields.some((field) =>
          field?.toLowerCase().includes(searchLower)
        )
        if (!matches) return false
      }

      // Date filter
      if (filters.timePeriod !== "all") {
        let dateFrom: Date | null = null
        let dateTo: Date | null = null

        if (filters.timePeriod === "custom") {
          dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null
          dateTo = filters.dateTo ? new Date(filters.dateTo) : null
        } else {
          const range = getDateRange(filters.timePeriod)
          dateFrom = range.from
          dateTo = range.to
        }

        if (invoice.invoice_date) {
          const invoiceDate = new Date(invoice.invoice_date)
          if (dateFrom && invoiceDate < dateFrom) return false
          if (dateTo && invoiceDate > dateTo) return false
        }
      }

      // Amount filter
      const minAmount = filters.amountMin ? parseFloat(filters.amountMin) : null
      const maxAmount = filters.amountMax ? parseFloat(filters.amountMax) : null
      
      if (minAmount !== null && invoice.total_amount < minAmount) return false
      if (maxAmount !== null && invoice.total_amount > maxAmount) return false

      return true
    })
  }, [invoices, filters, companyNames, getDateRange])

  // Notify parent of filtered results
  useEffect(() => {
    onFilteredInvoicesChange(filteredInvoices)
  }, [filteredInvoices, onFilteredInvoicesChange])

  // Toggle status
  const toggleStatus = (status: InvoiceStatus) => {
    setFilters((prev) => {
      const newStatuses = new Set(prev.statuses)
      if (newStatuses.has(status)) {
        newStatuses.delete(status)
      } else {
        newStatuses.add(status)
      }
      return { ...prev, statuses: newStatuses }
    })
  }

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== "" ||
      filters.statuses.size !== 5 ||
      filters.showOverdue ||
      filters.timePeriod !== "all" ||
      filters.amountMin !== "" ||
      filters.amountMax !== ""
    )
  }, [filters])

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.statuses.size !== 5) count++
    if (filters.showOverdue) count++
    if (filters.timePeriod !== "all") count++
    if (filters.amountMin || filters.amountMax) count++
    return count
  }, [filters])

  // Reset all filters
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  // Get active time period label
  const getTimePeriodLabel = () => {
    const period = TIME_PERIODS.find((p) => p.id === filters.timePeriod)
    if (filters.timePeriod === "custom" && (filters.dateFrom || filters.dateTo)) {
      return "Benutzerdefiniert"
    }
    return period?.label || "Zeitraum"
  }

  // Get amount filter label
  const getAmountLabel = () => {
    if (filters.amountMin && filters.amountMax) {
      return `${filters.amountMin}€ - ${filters.amountMax}€`
    }
    if (filters.amountMin) return `ab ${filters.amountMin}€`
    if (filters.amountMax) return `bis ${filters.amountMax}€`
    return "Betrag"
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Suchen nach Rechnungsnummer, Empfänger oder Betrag..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          className="pl-10 pr-10"
        />
        {filters.search && (
          <button
            onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.entries(STATUS_CONFIG) as [InvoiceStatus, typeof STATUS_CONFIG[InvoiceStatus]][]).map(
            ([status, config]) => (
              <ToggleButton
                key={status}
                label={config.label}
                checked={filters.statuses.has(status)}
                onChange={() => toggleStatus(status)}
                colorClass={config.colorClass}
              />
            )
          )}
        </div>

        <div className="h-6 w-px bg-neutral-200 mx-1" />

        {/* Overdue toggle */}
        <ToggleButton
          label="Überfällig"
          checked={filters.showOverdue}
          onChange={(checked) => setFilters((prev) => ({ ...prev, showOverdue: checked }))}
          colorClass="bg-red-500"
        />

        <div className="h-6 w-px bg-neutral-200 mx-1" />

        {/* Time period filter */}
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-1.5",
                filters.timePeriod !== "all" && "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              {getTimePeriodLabel()}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-1">
              {TIME_PERIODS.filter((p) => p.id !== "custom").map((period) => (
                <button
                  key={period.id}
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      timePeriod: period.id,
                      dateFrom: null,
                      dateTo: null,
                    }))
                    if (period.id !== "custom") setDatePopoverOpen(false)
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    filters.timePeriod === period.id
                      ? "bg-neutral-100 font-medium"
                      : "hover:bg-neutral-50"
                  )}
                >
                  {period.label}
                </button>
              ))}
              
              <div className="border-t border-neutral-100 pt-2 mt-2">
                <div className="px-3 py-1 text-xs font-medium text-neutral-500 uppercase">
                  Benutzerdefiniert
                </div>
                <div className="space-y-2 p-2">
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Von</label>
                    <DatePicker
                      value={filters.dateFrom}
                      onChange={(date) =>
                        setFilters((prev) => ({
                          ...prev,
                          timePeriod: "custom",
                          dateFrom: date,
                        }))
                      }
                      placeholder="Startdatum"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Bis</label>
                    <DatePicker
                      value={filters.dateTo}
                      onChange={(date) =>
                        setFilters((prev) => ({
                          ...prev,
                          timePeriod: "custom",
                          dateTo: date,
                        }))
                      }
                      placeholder="Enddatum"
                    />
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Amount filter */}
        <Popover open={amountPopoverOpen} onOpenChange={setAmountPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-1.5",
                (filters.amountMin || filters.amountMax) &&
                  "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
              )}
            >
              <Euro className="h-3.5 w-3.5" />
              {getAmountLabel()}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4" align="start">
            <div className="space-y-3">
              <div className="text-sm font-medium">Betragsbereich</div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Mindestens</label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={filters.amountMin}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, amountMin: e.target.value }))
                      }
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                      €
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Höchstens</label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="∞"
                      value={filters.amountMax}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, amountMax: e.target.value }))
                      }
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                      €
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, amountMin: "", amountMax: "" }))
                  setAmountPopoverOpen(false)
                }}
              >
                Zurücksetzen
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <>
            <div className="h-6 w-px bg-neutral-200 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-1.5 text-neutral-500 hover:text-neutral-900"
            >
              <X className="h-3.5 w-3.5" />
              Filter zurücksetzen
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-neutral-200 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </>
        )}

        {/* Results count */}
        <div className="ml-auto text-sm text-neutral-500">
          {filteredInvoices.length === invoices.length ? (
            <span>{invoices.length} Rechnungen</span>
          ) : (
            <span>
              {filteredInvoices.length} von {invoices.length} Rechnungen
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
