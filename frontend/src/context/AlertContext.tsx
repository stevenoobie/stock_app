// src/context/AlertContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import { AlertMessage } from "@/components/alert-message";

type AlertType = "success" | "error" | "info";

interface Alert {
  id: number;
  type: AlertType;
  title: string;
  message: string;
}

interface AlertContextType {
  showAlert: (type: AlertType, title: string, message: string) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = (type: AlertType, title: string, message: string) => {
    const id = Date.now();
    const newAlert: Alert = { id, type, title, message };
    setAlerts((prev) => [...prev, newAlert]);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 4000);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      {/* Render all active alerts fixed on top */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-99999 w-80 ">
        {alerts.map((alert) => (
          <AlertMessage
            key={alert.id}
            type={alert.type}
            title={alert.title}
            message={alert.message}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used inside AlertProvider");
  return ctx;
};
