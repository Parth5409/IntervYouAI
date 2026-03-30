import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-mono uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400",
        destructive:
          "bg-red-500 text-slate-50 hover:bg-red-600",
        outline:
          "border border-slate-800 bg-transparent text-slate-400 hover:border-emerald-500 hover:text-emerald-500",
        secondary:
          "bg-slate-800 text-slate-50 hover:bg-slate-700",
        ghost: "hover:bg-slate-900 hover:text-emerald-500",
        link: "text-emerald-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), loading && "opacity-70 pointer-events-none")}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </div>
        ) : children}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
export default Button;
