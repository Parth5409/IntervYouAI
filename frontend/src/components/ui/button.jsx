import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-headline font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-black hover:brightness-110 shadow-lg shadow-primary/10",
        destructive:
          "bg-error text-white hover:opacity-90 shadow-sm",
        outline:
          "border border-outline-variant hover:border-white text-on-surface font-bold transition-all",
        secondary:
          "bg-surface-container-high/40 border border-outline-variant/50 text-on-surface font-bold rounded-lg text-xs hover:bg-surface-container-highest transition-all",
        ghost: "text-on-surface-variant hover:text-white hover:bg-surface-container transition-all",
        link: "text-primary hover:underline underline-offset-4 font-bold",
        primary: "py-5 bg-primary text-black font-headline font-bold text-lg rounded-xl hover:bg-primary-dim transition-all duration-300 active:scale-[0.99]",
        white: "bg-white text-black font-headline font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-primary transition-all",
      },
      size: {
        default: "h-12 px-6 py-3",
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
