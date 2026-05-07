"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, label, id, checked, onChange, name, ...props }, ref) => {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  const handleCheckedChange = (value) => {
    if (onChange) {
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
          "peer h-4 w-4 shrink-0 rounded-none border border-outline-variant/30 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-secondary data-[state=checked]:text-slate-950",
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
          className="text-sm font-mono text-on-surface cursor-pointer peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
        >
          {label}
        </label>
      )}
    </div>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
