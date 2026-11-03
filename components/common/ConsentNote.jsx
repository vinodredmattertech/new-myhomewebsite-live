import Link from "next/link";

/**
 * ConsentNote — the one-line consent shown above every form's submit button:
 * submitting agrees to the Privacy Policy and to being contacted. `tone`
 * matches the surface it sits on ("light" for white/cream panels, "dark" for
 * the charcoal footer).
 */
export default function ConsentNote({ tone = "light", className = "" }) {
  const colors =
    tone === "dark"
      ? "text-white/60 [&_a]:text-white"
      : "text-[#6b645b] [&_a]:text-[#ef493d]";
  return (
    <p
      className={`font-montserrat text-[11.5px] sm:text-[12px] lg:text-[0.677vw] leading-[1.6] ${colors} ${className}`}
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      By submitting, you agree to our{" "}
      <Link
        href="/privacy-policy"
        target="_blank"
        rel="noopener"
        className="underline underline-offset-2 hover:no-underline"
      >
        Privacy Policy
      </Link>{" "}
      and consent to My Home Group contacting you by call, SMS, email or WhatsApp.
    </p>
  );
}
