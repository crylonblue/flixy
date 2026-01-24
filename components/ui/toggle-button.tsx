"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToggleButtonProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
  colorClass?: string
}

export function ToggleButton({
  label,
  checked,
  onChange,
  className,
  colorClass,
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-150",
        checked
          ? "border-transparent text-white"
          : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900",
        checked && colorClass,
        className
      )}
      style={
        checked && !colorClass
          ? { backgroundColor: "var(--accent)", borderColor: "var(--accent)" }
          : undefined
      }
    >
      {checked && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
      {label}
    </button>
  )
}
