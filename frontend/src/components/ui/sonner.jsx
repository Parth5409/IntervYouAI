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
            "group toast font-mono rounded-none group-[.toaster]:bg-surface-container-low group-[.toaster]:text-on-surface group-[.toaster]:border-outline-variant/30 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-on-surface-variant",
          actionButton:
            "group-[.toast]:bg-emerald-500 group-[.toast]:text-slate-950 group-[.toast]:font-bold group-[.toast]:rounded-none",
          cancelButton:
            "group-[.toast]:bg-surface-container-low group-[.toast]:text-on-surface-variant group-[.toast]:rounded-none",
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
