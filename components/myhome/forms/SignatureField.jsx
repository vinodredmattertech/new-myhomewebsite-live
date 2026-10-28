import React, { useEffect, useRef, useState } from "react";
import { Eraser, PenLine, Upload, X } from "lucide-react";
import { GOLD, Label, errorCls } from "@/components/myhome/forms/DocumentUI";

/* Signature images: drawn ones are PNG; uploads may be PNG or JPG. */
export const SIGNATURE_MAX_MB = 2;
export const SIGNATURE_EXT = [".png", ".jpg", ".jpeg"];

const INK = "#1f1d1b";

const tabCls = (active) =>
  `inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
    active ? "bg-[#1f1d1b] text-white" : "text-[#6b645b] hover:text-[#1f1d1b]"
  }`;

/**
 * A signature, captured either by drawing in a pad (finger, pen or mouse) or
 * by uploading an image of one. `value` is a File (PNG when drawn) or null;
 * `onChange` receives the same, ready to send as a media upload. Use through
 * react-hook-form's Controller.
 */
export default function SignatureField({ label, value, onChange, onBlur, error, fileName = "signature" }) {
  const [mode, setMode] = useState("draw");
  const [preview, setPreview] = useState(null);
  // True once the pad has been drawn on since this field mounted; until then a
  // held value (e.g. signed before a modal was closed) is shown as an image.
  const [padActive, setPadActive] = useState(false);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const inked = useRef(false);
  const uploadRef = useRef(null);

  // Preview the held image, unless it is being drawn on the pad right now.
  useEffect(() => {
    if (!value || (mode === "draw" && padActive)) return setPreview(null);
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value, mode, padActive]);

  // Size the pad's backing store to its box at device resolution. Done when a
  // signature starts on a blank pad (a pad in a modal may have no size when it
  // mounts); later resizes only stretch it, so a signature is never wiped.
  const preparePad = (canvas) => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.2 * dpr;
    ctx.strokeStyle = INK;
  };

  const point = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return [
      ((e.clientX - rect.left) * canvas.width) / rect.width,
      ((e.clientY - rect.top) * canvas.height) / rect.height,
    ];
  };

  const start = (e) => {
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    drawing.current = true;
    if (!inked.current) preparePad(canvasRef.current);
    const ctx = canvasRef.current.getContext("2d");
    const [x, y] = point(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
    inked.current = true;
    setPadActive(true);
  };

  const move = (e) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const [x, y] = point(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    inked.current = false;
    onChange(null);
  };

  // Every finished stroke re-exports the pad, so the value is always the
  // signature as it stands — no separate "save" step to forget.
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (!inked.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) onChange(new File([blob], `${fileName}.png`, { type: "image/png" }));
      onBlur?.();
    }, "image/png");
  };

  const reset = () => {
    inked.current = false;
    onChange(null);
    if (uploadRef.current) uploadRef.current.value = "";
  };

  const switchTo = (next) => {
    if (next === mode) return;
    reset();
    setMode(next);
  };

  const border = error ? "border-[#e0897f] bg-[#fdf6f5]/80" : "border-[#d6cdbf] bg-[#fcfbf8]/70";

  return (
    <div className="flex flex-col w-full gap-[8px]">
      <div className="flex items-center justify-between gap-[12px]">
        <Label text={label} />
        <div role="tablist" className="flex items-center gap-[2px] rounded-full border border-[#e2dcd2] p-[2px] bg-white">
          <button type="button" role="tab" aria-selected={mode === "draw"} onClick={() => switchTo("draw")} className={tabCls(mode === "draw")}>
            <PenLine className="w-[12px] h-[12px]" strokeWidth={2} /> Draw
          </button>
          <button type="button" role="tab" aria-selected={mode === "upload"} onClick={() => switchTo("upload")} className={tabCls(mode === "upload")}>
            <Upload className="w-[12px] h-[12px]" strokeWidth={2} /> Upload
          </button>
        </div>
      </div>

      <div className={`relative w-full h-[170px] rounded-[3px] border border-dashed ${border} transition-colors`}>
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={`${label} preview`} className="absolute inset-0 m-auto max-w-[90%] max-h-[80%] object-contain" />
            <button
              type="button"
              onClick={reset}
              className="absolute top-[8px] right-[8px] inline-flex items-center gap-[4px] rounded-full bg-white border border-[#e2dcd2] px-[10px] py-[4px]
                         text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6b645b] hover:text-[#ef493d] hover:border-[#ef493d] transition-colors"
            >
              <X className="w-[12px] h-[12px]" strokeWidth={2} /> Remove
            </button>
          </>
        ) : mode === "draw" ? (
          <>
            <canvas
              ref={canvasRef}
              data-lenis-prevent
              aria-label={`${label}: draw your signature`}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
            />
            {/* The line to sign on. */}
            <span aria-hidden="true" className="pointer-events-none absolute left-[24px] right-[24px] bottom-[42px] h-px bg-[#d6cdbf]" />
            <span aria-hidden="true" className="pointer-events-none absolute left-[24px] bottom-[16px] text-[11px] text-[#a59d92]">
              Sign above the line
            </span>
            <button
              type="button"
              onClick={clearPad}
              className="absolute bottom-[10px] right-[10px] inline-flex items-center gap-[4px] rounded-full bg-white border border-[#e2dcd2] px-[10px] py-[4px]
                         text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6b645b] hover:text-[#1f1d1b] transition-colors"
            >
              <Eraser className="w-[12px] h-[12px]" strokeWidth={2} /> Clear
            </button>
          </>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center gap-[8px] cursor-pointer text-center px-[16px]">
            <Upload className="w-[20px] h-[20px]" strokeWidth={1.6} style={{ color: GOLD }} />
            <span className="text-[13px] text-[#6b645b]">Upload an image of the signature</span>
            <span className="text-[11.5px] text-[#a59d92]">PNG or JPG · up to {SIGNATURE_MAX_MB}MB · on plain white paper</span>
            <input
              ref={uploadRef}
              type="file"
              accept={SIGNATURE_EXT.join(",")}
              className="sr-only"
              aria-label={label}
              onChange={(e) => {
                onChange(e.target.files?.[0] || null);
                onBlur?.();
              }}
            />
          </label>
        )}
      </div>
      {error?.message && <span className={errorCls}>{error.message}</span>}
    </div>
  );
}

/** react-hook-form `validate` rules for a SignatureField value. */
export const signatureRules = (label, required) => ({
  validate: {
    required: (file) => !required || !!file || `Please add the ${label.toLowerCase()}`,
    type: (file) => !file || SIGNATURE_EXT.some((ext) => file.name.toLowerCase().endsWith(ext)) || "Upload a PNG or JPG image",
    size: (file) => !file || file.size <= SIGNATURE_MAX_MB * 1024 * 1024 || `Image must be under ${SIGNATURE_MAX_MB}MB`,
  },
});
