"use client"

import { useTheme } from "@/hooks/useTheme"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast font-mono rounded-none group-[.toaster]:bg-slate-950 group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-800 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-slate-400",
          actionButton:
            "group-[.toast]:bg-emerald-500 group-[.toast]:text-slate-950 group-[.toast]:font-bold group-[.toast]:rounded-none",
          cancelButton:
            "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-400 group-[.toast]:rounded-none",
          success: "group-[.toast]:text-emerald-500",
          error: "group-[.toast]:text-red-500",
          warning: "group-[.toast]:text-amber-500",
          info: "group-[.toast]:text-sky-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
