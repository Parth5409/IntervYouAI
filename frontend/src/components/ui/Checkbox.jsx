"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, label, id, checked, onChange, name, ...props }, ref) => {
  const checkboxId = id || React.useId();

  const handleCheckedChange = (value) => {
    if (onChange) {
      // Simulate a standard event object for compatibility with handleInputChange
      onChange({
        target: {
          name: name,
          type: 'checkbox',
          checked: value,
          value: value
        }
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        name={name}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-none border border-slate-800 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-slate-950",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn("flex items-center justify-center text-current")}
        >
          <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label 
          htmlFor={checkboxId}
          className="text-sm font-mono text-slate-200 uppercase tracking-tight cursor-pointer peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
        >
          {label}
        </label>
      )}
    </div>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
export default Checkbox;
