// Simplified version of use-toast.ts for our purposes
import { useState } from "react";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function toast(props: ToastProps) {
  // This is a simplified version that doesn't actually show toasts
  // but provides the API for our component
  console.log("Toast:", props);
  return {
    id: "1",
    dismiss: () => {},
    update: () => {},
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  return {
    toast,
    dismiss: (id: string) => {
      setToasts((toasts) => toasts.filter((t) => t !== toasts[Number(id)]));
    },
    toasts,
  };
} 