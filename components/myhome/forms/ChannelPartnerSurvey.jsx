import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ArrowRight, Check, Copy } from "lucide-react";
import DynamicForm from "@/components/myhome/forms/DynamicForm";
import { DocumentSheet, FieldRow, inputCls, textCls } from "@/components/myhome/forms/DocumentUI";
import { lookupChannelPartner, verifyChannelPartner } from "@/lib/strapi";

/**
 * ChannelPartnerSurvey — a survey that is shared through channel partners'
 * own links (`?uid=<CP Unique ID>`), so every response is tagged with the
 * partner who sent it.
 *
 *   no uid       → the partner enters their Company Partner Name; a match in
 *                  CP Data shows their link (?uid=…) with a Copy button
 *   valid uid    → the survey, tagged with that partner
 *   unknown uid  → back to the name step, with a note that the link is invalid
 */
export default function ChannelPartnerSurvey({ config }) {
  const router = useRouter();
  const uid = typeof router.query.uid === "string" ? router.query.uid.trim() : "";
  // status: "pending" until the URL has been read (the server, and the
  // browser's first render, can't see the query — both draw "Loading…"),
  // then "idle" | "checking" | "valid" | "invalid" | "error".
  const [link, setLink] = useState({ status: "pending", partner: null });

  useEffect(() => {
    if (!router.isReady) return undefined;
    if (!uid) {
      setLink({ status: "idle", partner: null });
      return undefined;
    }
    let cancelled = false;
    setLink({ status: "checking", partner: null });
    verifyChannelPartner(uid).then((partner) => {
      if (cancelled) return;
      if (partner) setLink({ status: "valid", partner });
      else setLink({ status: partner === false ? "invalid" : "error", partner: null });
    });
    return () => {
      cancelled = true;
    };
  }, [router.isReady, uid]);

  const surveyConfig = useMemo(() => {
    if (link.status !== "valid") return null;
    return {
      ...config,
      fixed: { ...(config.fixed || {}), cpUniqueId: link.partner.uniqueId },
      intro: [...(config.intro || []), `Shared by ${link.partner.companyName} (${link.partner.uniqueId}).`],
    };
  }, [config, link]);

  if (link.status === "pending" || link.status === "checking") {
    return <DocumentSheet eyebrow={config.label} heading={config.heading} intro={["Loading…"]} />;
  }
  if (surveyConfig) return <DynamicForm config={surveyConfig} />;

  return (
    <PartnerNameStep
      config={config}
      notice={
        link.status === "invalid"
          ? "This survey link isn't valid. Enter your company partner name to get the correct link."
          : link.status === "error"
            ? "We couldn't check this survey link. Please try again."
            : null
      }
    />
  );
}

/** Step 1: find the partner by their Company Partner Name. */
function PartnerNameStep({ config, notice }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  // The partner whose link is shown, ready to copy and share with customers.
  const [partner, setPartner] = useState(null);
  const [copied, setCopied] = useState(false);

  const surveyLink = partner
    ? `${window.location.origin}${window.location.pathname}?uid=${encodeURIComponent(partner.uniqueId)}`
    : "";

  const showLink = (p) => {
    setPartner(p);
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(surveyLink);
    } catch (err) {
      // Clipboard API unavailable (e.g. plain http on a LAN address): select
      // the link so it can be copied by hand.
      document.getElementById("cp-survey-link")?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const value = name.trim().replace(/\s+/g, " ");
    setMatches([]);
    setPartner(null);
    if (value.length < 2) return setError({ message: "Please enter the company partner name" });
    setError(null);
    setBusy(true);
    const found = await lookupChannelPartner(value);
    setBusy(false);
    if (found === null) return setError({ message: "Couldn't check the name right now. Please try again." });
    if (found.length === 0) {
      return setError({
        message: "No channel partner is registered with this name. Check the spelling, or contact My Home Group.",
      });
    }
    if (found.length === 1) return showLink(found[0]);
    // The same partner in more than one firm: let them pick.
    setMatches(found);
  };

  return (
    <DocumentSheet
      eyebrow={config.label}
      heading={config.heading}
      intro={["Channel partners: enter your company partner name to get your survey link."]}
    >
      <form noValidate onSubmit={submit} className="relative mt-[48px] md:mt-[56px] mx-auto max-w-[520px] flex flex-col gap-[20px]">
        {notice && (
          <p role="alert" className="border-l-2 border-[#ef493d] pl-[14px] text-[#6b645b] text-[13.5px] leading-[22px]">
            {notice}
          </p>
        )}
        <FieldRow label="Company Partner Name*" error={error}>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!error || undefined}
            className={inputCls}
          />
        </FieldRow>

        {matches.length > 0 && (
          <div className="flex flex-col gap-[8px]">
            <p className={`text-[#3d3935] ${textCls}`}>This name is registered with more than one firm. Choose yours:</p>
            {matches.map((m) => (
              <button
                key={m.uniqueId}
                type="button"
                onClick={() => showLink(m)}
                className={`text-left rounded-[3px] border px-[14px] py-[11px] text-[#1f1d1b] transition-colors
                            hover:border-[#ef493d] hover:bg-[#fef7f6] ${
                              partner?.uniqueId === m.uniqueId ? "border-[#ef493d] bg-[#fef7f6]" : "border-[#e6e0d6] bg-white/70"
                            }`}
              >
                {m.companyName}
              </button>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="group self-center inline-flex items-center justify-center gap-[12px] h-[54px] px-[40px] rounded-[2px]
                     bg-[#1f1d1b] text-white uppercase font-semibold tracking-[0.18em] text-[12px]
                     hover:bg-[#ef493d] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? "Checking…" : "Submit"}
          <ArrowRight className="w-[16px] h-[16px] transition-transform duration-300 group-hover:translate-x-[3px]" strokeWidth={1.6} />
        </button>

        {partner && (
          <div role="status" className="flex flex-col gap-[10px] border-t border-[#e6e0d6] pt-[22px]">
            <p className={`text-[#3d3935] ${textCls}`}>
              Survey link for <span className="font-semibold text-[#1f1d1b]">{partner.companyName}</span> ({partner.uniqueId}). Share it with your customers:
            </p>
            <div className="flex items-stretch gap-[8px]">
              <input
                id="cp-survey-link"
                readOnly
                value={surveyLink}
                onFocus={(e) => e.target.select()}
                aria-label="Survey link"
                className="flex-1 min-w-0 rounded-[3px] border border-[#e2dcd2] bg-[#fcfbf8] px-[12px] py-[10px] text-[13.5px] text-[#1f1d1b] outline-none focus:border-[#3d3935]"
              />
              <button
                type="button"
                onClick={copy}
                className="shrink-0 inline-flex items-center gap-[6px] rounded-[3px] bg-[#1f1d1b] px-[16px] text-white text-[11px] font-semibold uppercase tracking-[0.14em] hover:bg-[#ef493d] transition-colors"
              >
                {copied ? <Check className="w-[14px] h-[14px]" strokeWidth={2} /> : <Copy className="w-[14px] h-[14px]" strokeWidth={1.8} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </form>
    </DocumentSheet>
  );
}
