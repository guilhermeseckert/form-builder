"use client"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 w-full max-w-md">
      {toasts.map((toast, index) => (
        <div
          key={index}
          className={`p-4 rounded-md shadow-lg border ${
            toast.variant === "destructive" ? "bg-destructive text-white" : "bg-background"
          }`}
        >
          {toast.title && <h3 className="font-medium">{toast.title}</h3>}
          {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
        </div>
      ))}
    </div>
  )
}

