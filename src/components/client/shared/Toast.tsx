"use client";
import { useState, useEffect } from "react";

type ToastType = "success" | "error" | "info" | "warning";
interface ToastItem { id: number; message: string; type: ToastType; }

let toastId = 0;
const listeners: Array<(toast: ToastItem) => void> = [];

export function showToast(message: string, type: ToastType = "info") {
  const toast: ToastItem = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(toast));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  useEffect(() => {
    const handler = (toast: ToastItem) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), 4000);
    };
    listeners.push(handler);
    return () => { const idx = listeners.indexOf(handler); if (idx >= 0) listeners.splice(idx, 1); };
  }, []);
  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>&times;</button>
        </div>
      ))}
    </div>
  );
}
