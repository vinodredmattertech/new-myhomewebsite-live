"use client";

import React, { useEffect, useRef } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidthClass = "max-w-4xl",
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setTimeout(() => panelRef.current?.focus(), 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Modal"}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={[
          "relative w-[92%] sm:w-[88%] bg-white rounded-2xl shadow-2xl outline-none",
          maxWidthClass,
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#EFE7DC]">
          <div className="min-w-0">
            {title ? (
              <h3 className="text-[#7C7262] text-center font-medium text-[18px] sm:text-[20px]">
                {title}
              </h3>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid place-items-center h-10 w-10 rounded-full border border-[#E7E1D8] text-[#7C7262] hover:bg-[#FAF6F0] transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 py-6 max-h-[80vh] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}