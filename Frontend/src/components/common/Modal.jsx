import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders children in a portal attached to document.body so that
 * CSS stacking contexts on animated layout wrappers never clip the overlay.
 *
 * Props:
 *   onClose  – called when the backdrop is clicked
 *   children – modal content (the white card)
 */
export default function Modal({ onClose, children }) {
  // Prevent background scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div
      className="mc-fade-in fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      {children}
    </div>,
    document.body
  );
}
