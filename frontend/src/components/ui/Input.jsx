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
            className="block text-[10px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] ml-1 opacity-60 transition-opacity group-focus-within:opacity-100"
          >
            {label}
          </label>
        )}
        <div className="relative group/field">
          {leftElement && (
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center justify-center text-primary opacity-40 group-focus-within/field:opacity-100 transition-all duration-300">
              {leftElement}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "w-full bg-surface-container-highest/30 border border-outline-variant/10 rounded-2xl py-5 transition-all duration-500 backdrop-blur-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-white placeholder:text-on-surface-variant/20 font-body text-base",
              leftElement ? "pl-16" : "pl-6",
              rightElement ? "pr-16" : "pr-6",
              error && "border-red-500/50 focus:ring-red-500/10 focus:border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
              !error && "focus:shadow-[0_0_30px_rgba(255,145,90,0.15)]",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center justify-center text-primary opacity-40">
              {rightElement}
            </div>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] text-red-400 font-extrabold uppercase tracking-widest mt-2 ml-1"
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
