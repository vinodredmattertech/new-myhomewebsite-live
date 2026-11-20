import React, { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useRouter } from "next/router";

/**
 * Homepage hero banner lead popup — name / email / phone only.
 * Submits exclusively to /api/home-banner-lead (dedicated Gmail SMTP).
 */
export default function HomeBannerLeadPopup({ open, onClose }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ kind: "", message: "" });

  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setPhone("");
    setSubmitting(false);
    setStatus({ kind: "", message: "" });
  }, [open]);

  function validate() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const phoneDigits = phone.replace(/\D/g, "");
    if (trimmedName.length < 2) return "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return "Please enter a valid email address.";
    }
    if (phoneDigits.length < 10) {
      return "Please enter a valid 10-digit phone number.";
    }
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const error = validate();
    if (error) {
      setStatus({ kind: "error", message: error });
      return;
    }

    setSubmitting(true);
    setStatus({ kind: "", message: "" });

    try {
      const res = await fetch("/api/home-banner-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({
          kind: "error",
          message: data.message || "Could not submit. Please try again.",
        });
        return;
      }
      setStatus({
        kind: "success",
        message: "Thank you! Redirecting…",
      });
      setName("");
      setEmail("");
      setPhone("");
      onClose();
      router.push("/thank-you");
      return;
    } catch (err) {
      setStatus({
        kind: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[200]">
      <div className="fixed inset-0 bg-black/55" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className="home-banner-popup w-full max-w-[440px] bg-[#f7f4ef] shadow-xl outline-none">
            <div className="flex items-start justify-between gap-4 border-b border-[#1a1a18]/10 px-5 py-4 sm:px-6">
              <div>
                <p className="m-0 text-[11px] uppercase tracking-[0.14em] text-[#577486]">
                  My Home Group
                </p>
                <DialogTitle className="m-0 mt-1 font-[300] text-[24px] leading-tight text-[#1a1a18] sm:text-[28px]"
                  style={{
                    fontFamily:
                      '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond",serif',
                  }}
                >
                  Enquire now
                </DialogTitle>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="mt-1 inline-flex h-9 w-9 items-center justify-center border border-[#1a1a18]/20 text-[#1a1a18] transition hover:bg-[#1a1a18] hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 px-5 py-5 sm:px-6 sm:py-6" noValidate>
              <label className="grid gap-1.5 text-[13px] text-[#1a1a18]">
                Name*
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="border border-[#1a1a18]/18 bg-white px-3 py-3 text-[15px] outline-none focus:border-[#577486]"
                />
              </label>

              <label className="grid gap-1.5 text-[13px] text-[#1a1a18]">
                Email ID*
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="border border-[#1a1a18]/18 bg-white px-3 py-3 text-[15px] outline-none focus:border-[#577486]"
                />
              </label>

              <label className="grid gap-1.5 text-[13px] text-[#1a1a18]">
                Phone Number*
                <div className="flex border border-[#1a1a18]/18 bg-white focus-within:border-[#577486]">
                  <span className="inline-flex items-center bg-[#e8eef2] px-3 text-[14px] text-[#1a1a18]">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
                    placeholder="10-digit mobile"
                    required
                    className="w-full border-0 bg-transparent px-3 py-3 text-[15px] outline-none"
                  />
                </div>
              </label>

              {status.message ? (
                <p
                  role="status"
                  className={`m-0 text-[13px] ${
                    status.kind === "error" ? "text-[#8a1f1f]" : "text-[#1f6b3a]"
                  }`}
                >
                  {status.message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 w-full bg-[#1a1a18] px-4 py-3 text-[15px] text-white transition enabled:hover:bg-[#333] disabled:cursor-wait disabled:opacity-70"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
