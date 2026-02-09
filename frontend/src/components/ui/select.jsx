"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = React.forwardRef(({ className, options = [], value, onChange, placeholder, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-none border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span className="truncate">{options.find(opt => opt.value === value)?.label || placeholder}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full border border-slate-800 bg-slate-950 p-1 shadow-md animate-in fade-in-0 zoom-in-95">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-none py-1.5 pl-8 pr-2 text-sm font-mono outline-none hover:bg-slate-900 hover:text-emerald-500 focus:bg-slate-900 focus:text-emerald-500",
                value === option.value && "bg-slate-900 text-emerald-500"
              )}
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {value === option.value && <Check className="h-4 w-4" />}
              </span>
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})
Select.displayName = "Select"

export { Select }
