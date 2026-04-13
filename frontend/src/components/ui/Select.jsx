"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef(({ className, options = [], value, onChange, placeholder, label, error, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="space-y-3 w-full relative group" ref={containerRef}>
      {label && (
        <label className="font-extrabold text-[10px] text-on-surface-variant uppercase tracking-[0.3em] block ml-1 opacity-60">
          {label}
        </label>
      )}
      <button
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-16 w-full items-center justify-between rounded-2xl border border-outline-variant/10 bg-surface-container-highest/30 px-6 py-4 text-sm font-extrabold transition-all duration-300 backdrop-blur-3xl hover:bg-surface-container-highest/50 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20",
          isOpen && "border-primary/50 shadow-[0_0_20px_rgba(255,145,90,0.15)]",
          error && "border-red-500/50",
          className
        )}
        {...props}
      >
        <span className={cn(
          "truncate transition-colors",
          selectedOption ? "text-white" : "text-on-surface-variant opacity-40 uppercase tracking-widest text-[11px]"
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-primary opacity-60"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[100] mt-3 w-full border border-outline-variant/10 bg-surface-container-high p-2 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={option.value}
                  onClick={() => {
                    onChange?.(option.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-xl py-4 px-10 text-xs font-extrabold uppercase tracking-widest transition-all duration-300",
                    value === option.value 
                      ? "bg-primary text-on-primary shadow-lg scale-[0.98]" 
                      : "text-on-surface-variant hover:bg-surface-container-highest hover:text-white"
                  )}
                >
                  <span className="absolute left-4 opacity-60 italic text-[9px] tabular-nums">
                    0{idx + 1}
                  </span>
                  {option.label}
                  {value === option.value && (
                    <motion.span 
                      layoutId="select-check"
                      className="absolute right-4"
                    >
                      <Check className="h-4 w-4" />
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="font-extrabold text-[10px] text-red-400 uppercase tracking-widest mt-2 ml-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})
Select.displayName = "Select"

export { Select }
export default Select;
