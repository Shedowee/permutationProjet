import { useState, useCallback } from "react";
import { ToastContext } from "./ToastContextBase";
import Toast from "../components/Toast";

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const success = useCallback((message) => addToast("success", message), [addToast]);
  const error = useCallback((message) => addToast("error", message), [addToast]);
  const info = useCallback((message) => addToast("info", message), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, info }}>
      {children}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};
