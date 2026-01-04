import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary: Schwarzer Button mit weißem Text
        default:
          "bg-neutral-900 text-white border border-neutral-900 hover:bg-neutral-800 hover:border-neutral-800 active:bg-neutral-950",
        
        // Destructive: Gedecktes Rot
        destructive:
          "bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700 active:bg-red-800",
        
        // Outline: Weißer Button mit Border
        outline:
          "bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 active:bg-neutral-100",
        
        // Secondary: Grauer Button
        secondary:
          "bg-neutral-100 text-neutral-900 border border-neutral-200 hover:bg-neutral-200 hover:border-neutral-300 active:bg-neutral-250",
        
        // Ghost: Transparent mit Hover
        ghost:
          "bg-transparent text-neutral-700 border border-transparent hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-150",
        
        // Link: Nur Text
        link:
          "bg-transparent text-neutral-900 border-0 p-0 h-auto underline-offset-4 hover:underline hover:text-neutral-600 active:text-neutral-800",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs",
        lg: "h-11 rounded-md px-6 text-base",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
