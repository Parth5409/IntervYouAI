import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-headline font-bold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-on-surface text-surface-dim hover:bg-white shadow-[0_4px_12px_rgba(255,255,255,0.1)]",
        destructive:
          "bg-error text-white hover:bg-error-dim shadow-[0_4px_12px_rgba(255,115,81,0.2)]",
        outline:
          "border border-outline-variant bg-transparent text-on-surface hover:border-on-surface hover:bg-on-surface/5 font-medium",
        secondary:
          "bg-surface-container-highest text-white hover:bg-surface-bright",
        ghost: "hover:bg-on-surface/5 text-on-surface-variant hover:text-white font-medium uppercase tracking-widest text-[10px]",
        link: "text-primary hover:underline underline-offset-4 font-semibold",
        primary: "bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold hover:opacity-90 shadow-[0_4px_20px_rgba(255,145,90,0.3)]",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-10 text-base",
        icon: "h-11 w-11",
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
