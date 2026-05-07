import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from 'framer-motion';

const Input = React.forwardRef(
  ({ className, type, label, error, id, leftElement, rightElement, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="space-y-3 w-full group">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative group/field">
          {leftElement && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-primary/60 group-focus-within/field:text-primary transition-all duration-300">
              {leftElement}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "w-full bg-surface-container-lowest/50 border border-outline-variant rounded-xl py-4 transition-all duration-300 focus:outline-none input-focus-glow text-on-surface placeholder:text-outline/40 font-body text-base",
              leftElement ? "pl-12" : "pl-4",
              rightElement ? "pr-12" : "pr-4",
              error && "border-error/50 focus:ring-error/10 focus:border-error shadow-sm",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-primary/60">
              {rightElement}
            </div>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] text-error font-bold uppercase tracking-widest mt-2 ml-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
export default Input;
