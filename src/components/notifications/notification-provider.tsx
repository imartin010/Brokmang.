"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

type NotificationVariant = "success" | "error" | "info" | "warning";

type NotificationInput = {
  title?: string;
  message: string;
  variant?: NotificationVariant;
  duration?: number;
};

type Notification = {
  id: string;
  title?: string;
  message: string;
  variant: NotificationVariant;
  duration: number;
};

type NotificationContextValue = {
  notify: (notification: NotificationInput) => void;
  dismiss: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const DEFAULT_DURATION = 4500;

const VARIANT_STYLES: Record<NotificationVariant, { container: string; icon: ReactNode }> = {
  success: {
    container: "border-green-200 bg-green-50 text-green-900",
    icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  },
  error: {
    container: "border-red-200 bg-red-50 text-red-900",
    icon: <AlertCircle className="h-5 w-5 text-red-600" />,
  },
  info: {
    container: "border-blue-200 bg-blue-50 text-blue-900",
    icon: <Info className="h-5 w-5 text-blue-600" />,
  },
  warning: {
    container: "border-amber-200 bg-amber-50 text-amber-900",
    icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
  },
};

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));

    const timerId = timers.current.get(id);
    if (timerId) {
      window.clearTimeout(timerId);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    ({ message, title, variant = "info", duration = DEFAULT_DURATION }: NotificationInput) => {
      const id = generateId();
      const notification: Notification = {
        id,
        title,
        message,
        variant,
        duration,
      };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        const timeoutId = window.setTimeout(() => {
          dismiss(id);
        }, duration);
        timers.current.set(id, timeoutId);
      }
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify, dismiss }), [dismiss, notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[1200] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
        aria-live="polite"
        role="status"
      >
        {notifications.map((notification) => {
          const styles = VARIANT_STYLES[notification.variant];
          return (
            <div
              key={notification.id}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm translate-y-0 flex-col gap-2 rounded-2xl border p-4 shadow-xl transition-all duration-300",
                styles.container,
              )}
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0">{styles.icon}</span>
                <div className="flex-1 text-sm">
                  {notification.title ? (
                    <p className="font-semibold leading-tight">{notification.title}</p>
                  ) : null}
                  <p className="mt-1 leading-snug text-foreground/80">{notification.message}</p>
                </div>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => dismiss(notification.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-foreground/60 transition hover:border-foreground/10 hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }

  return context;
}
