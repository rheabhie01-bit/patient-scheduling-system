import { useEffect, useRef, useState } from "react";

function Modal({ isOpen, title, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, title, message, confirmText = "Yes, continue", onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <p className="confirm-text">{message}</p>
      <div className="form-buttons">
        <button onClick={onCancel}>Go back</button>
        <button className="danger solid" onClick={onConfirm}>{confirmText}</button>
      </div>
    </Modal>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className={`toast ${toast.type}`} role="status">
      <span>{toast.type === "success" ? "✓" : "!"}</span> {toast.message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = (message, type = "success") => {
    clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), 3200);
  };

  return { toast, showToast };
}

export default Modal;
