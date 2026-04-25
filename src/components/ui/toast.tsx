import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { X, AlertCircle } from "lucide-react";

interface ToastProps {
  message: string;
  variant?: "default" | "destructive";
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, variant = "default", duration = 5000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enter = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 z-[9999] flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300",
        "max-w-[90vw] sm:max-w-sm",
        visible
          ? "-translate-x-1/2 translate-y-0 opacity-100"
          : "-translate-x-1/2 -translate-y-4 opacity-0",
        variant === "destructive"
          ? "border-destructive/50 bg-card text-destructive"
          : "border-border bg-card text-card-foreground"
      )}
      role="alert"
    >
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={handleClose}
        className="ml-auto shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
