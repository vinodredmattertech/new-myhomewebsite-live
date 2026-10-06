import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { ChevronDown, Phone, X } from "lucide-react";
import { STRAPI_URL, submitLead } from "@/lib/strapi";
import CountryCodeSelect from "@/components/common/CountryCodeSelect";
import { dialCodeFor, validatePhone } from "@/lib/phone";
import { pushToCRM } from "@/lib/crm";

const MESSAGE_ICON = "/assets/myhome/tabler_message-filled.png";

// Published projects that can receive Sell.Do leads, alphabetical. The CRM
// route looks the Sell.Do ids up itself, so they are not requested here.
const SELLDO_PROJECTS_URL =
  `${STRAPI_URL}/api/projects?fields[0]=title&fields[1]=slug&fields[2]=badge` +
  `&filters[selldoProjectId][$notNull]=true&filters[selldoProjectId][$ne]=` +
  `&sort=title:asc&pagination[pageSize]=100`;

/**
 * Floating "Call Now" + "Request Site Visit" actions, shown on every page.
 *
 * _app.js renders a generic instance site-wide (default number, no project).
 * Project detail pages render their own with the project's phone, name and
 * slug instead, so the CRM push can file the lead against that project; they
 * opt out of the global one with `ProjectDetailPage.ownFloatingActions`.
 * Sell.Do files every lead against a project, so without a `projectSlug` the
 * modal asks for a "Preferred Project", listing only ongoing projects that
 * have a Sell.Do project id in Strapi, and sends that project's slug to the CRM
 * route. If that list can't be loaded the field is left out and the lead is
 * kept in Strapi only (the CRM route skips leads with no project).
 *
 * Desktop (lg+): pinned to the right edge, vertically centred. Each button
 * shows only its icon by default and expands smoothly on hover to reveal the
 * label. Mobile: a sticky bar fixed to the bottom of the viewport. Call Now
 * is hidden for now; only Request Site Visit is shown.
 *
 * "Call Now" dials the configured number; "Request Site Visit" opens a lead
 * form modal that posts to the CRM (same flow as the other project forms).
 */
export default function ProjectFloatingActions({
  phone = "+919154981691",
  // Empty outside project pages; the modal copy and payload adapt.
  projectName = "",
  projectSlug,
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  // Project choices for the site-wide instance (no projectSlug); null = not
  // loaded yet, [] = unavailable, in which case the field is not shown.
  const [projectOptions, setProjectOptions] = useState(null);
  const askProject = !projectSlug && projectOptions?.length > 0;

  useEffect(() => {
    if (!modalOpen || projectSlug || projectOptions !== null) return;
    let cancelled = false;
    fetch(SELLDO_PROJECTS_URL)
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => {
        const options = (json?.data || [])
          // Ongoing only: `badge` is "Ongoing" or empty for ongoing projects,
          // "Completed" / "Upcoming" otherwise.
          .filter((p) => {
            const badge = (p.attributes?.badge || "").trim().toLowerCase();
            return !badge || badge === "ongoing";
          })
          .map((p) => ({ title: p.attributes?.title, slug: p.attributes?.slug }))
          .filter((p) => p.title && p.slug);
        if (!cancelled) setProjectOptions(options);
      })
      .catch(() => !cancelled && setProjectOptions([]));
    return () => {
      cancelled = true;
    };
  }, [modalOpen, projectSlug, projectOptions]);

  // Lets globals.css lift the third-party chat widget above the mobile
  // bottom bar while this component is mounted.
  useEffect(() => {
    document.body.classList.add("has-mobile-action-bar");
    return () => document.body.classList.remove("has-mobile-action-bar");
  }, []);

  const {
    register,
    getValues,
    trigger,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const telHref = `tel:${(phone || "").replace(/\s+/g, "")}`;

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError(null);
    // On a project page the props win; elsewhere use the visitor's choice.
    const chosen = projectSlug
      ? null
      : (projectOptions || []).find((p) => p.slug === data.project);
    const leadSlug = projectSlug || chosen?.slug;
    const payload = {
      name: data.name,
      email: data.email,
      phone: `${dialCodeFor(data.countryCode)} ${data.phone}`.trim(),
      project: projectName || chosen?.title || "",
      message: [
        "Requested a site visit",
        data.preferredDate && `Preferred date: ${data.preferredDate}`,
        data.message,
      ]
        .filter(Boolean)
        .join("\n\n"),
      formSource: "Request Site Visit",
    };
    try {
      const [crmRes] = await Promise.all([
        pushToCRM({
          projectSlug: leadSlug,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          project_name: payload.project || "-",
          message: payload.message,
          FormSource: payload.formSource,
        }),
        submitLead(payload),
      ]);
      if (crmRes.ok) {
        reset();
        setModalOpen(false);
        router.push("/thank-you");
      } else {
        setSubmitError("Couldn't submit your request. Please try again.");
      }
    } catch (err) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ===== Desktop: right-edge expanding pills ===== */}
      <div className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-[70] flex-col items-end gap-[0.833vw]">
        <a
          href={telHref}
          aria-label="Call Now"
          className="group flex items-center overflow-hidden rounded-l-full
                     bg-[#fff] hover:bg-[#fff] text-[#d83a2f] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]
                     h-[3.333vw] pl-[1.042vw] pr-[1.042vw]
                     transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <Phone className="w-[1.25vw] h-[1.25vw] shrink-0" strokeWidth={1.8} />
          <span
            className="max-w-0 group-hover:max-w-[10vw] group-hover:ml-[0.625vw]
                       overflow-hidden whitespace-nowrap
                       font-montserrat font-medium capitalize text-[0.938vw]
                       transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Call Now
          </span>
        </a>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Request Site Visit"
          className="group flex items-center overflow-hidden rounded-l-full
                     bg-[#ef493d] hover:bg-[#d83a2f] text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]
                     h-[3.333vw] pl-[1.042vw] pr-[1.042vw]
                     transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <Image
            src={MESSAGE_ICON}
            alt=""
            width={26}
            height={26}
            unoptimized
            className="w-[1.25vw] h-[1.25vw] shrink-0 object-contain select-none [filter:brightness(0)_invert(1)]"
          />
          <span
            className="max-w-0 group-hover:max-w-[12vw] group-hover:ml-[0.625vw]
                       overflow-hidden whitespace-nowrap
                       font-montserrat font-medium capitalize text-[0.938vw]
                       transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Request Site Visit
          </span>
        </button>
      </div>

      {/* ===== Mobile: sticky bottom bar ===== */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-[70] flex shadow-[0_-6px_20px_-8px_rgba(0,0,0,0.35)]">
        <a
          href={telHref}
          className="hidden flex-1 items-center justify-center gap-[8px]
                     bg-[#fff] text-[#ef493d] h-[56px]
                     font-montserrat font-medium capitalize text-[15px]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <Phone className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
          Call Now
        </a>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex-1 flex items-center justify-center gap-[8px]
                     bg-[#d83a2f] text-white h-[56px]
                     font-montserrat font-medium capitalize text-[15px]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <Image
            src={MESSAGE_ICON}
            alt=""
            width={20}
            height={20}
            unoptimized
            className="w-[18px] h-[18px] shrink-0 object-contain select-none [filter:brightness(0)_invert(1)]"
          />
          Request Site Visit
        </button>
      </div>

      {/* ===== Request Site Visit modal ===== */}
      <Dialog
        open={modalOpen}
        onClose={() => (submitting ? null : setModalOpen(false))}
        className="fixed inset-0 z-[100]"
      >
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            className="relative w-full max-w-[460px] lg:max-w-[28vw]
                       bg-white rounded-[10px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]
                       px-[24px] py-[28px] sm:px-[32px] sm:py-[36px] lg:px-[2.083vw] lg:py-[2.604vw]"
          >
            <button
              type="button"
              onClick={() => (submitting ? null : setModalOpen(false))}
              aria-label="Close"
              className="absolute right-[12px] top-[12px] lg:right-[0.781vw] lg:top-[0.781vw]
                         inline-flex items-center justify-center rounded-full
                         w-[34px] h-[34px] lg:w-[2.083vw] lg:h-[2.083vw]
                         text-[#333] hover:text-[#ef493d] transition-colors"
            >
              <X className="w-[18px] h-[18px] lg:w-[1.146vw] lg:h-[1.146vw]" strokeWidth={1.8} />
            </button>

            <Dialog.Title
              className="text-[#333] leading-[1.2] capitalize
                         text-[22px] sm:text-[26px] lg:text-[1.667vw]"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                fontWeight: 400,
              }}
            >
              Request a Site Visit
            </Dialog.Title>
            <p
              className="font-montserrat text-[#6d6d6d] mt-[8px] lg:mt-[0.521vw]
                         text-[13px] sm:text-[14px] lg:text-[0.833vw]
                         leading-[20px] sm:leading-[22px] lg:leading-[1.302vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Share your details{projectName ? ` for ${projectName}` : ""} and
              our team will arrange a visit at your convenience.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-[20px] lg:mt-[1.302vw] flex flex-col gap-[16px] lg:gap-[1.042vw]"
              noValidate
            >
              <div>
                <input
                  type="text"
                  placeholder="Full Name*"
                  aria-invalid={!!errors.name || undefined}
                  className={`w-full bg-transparent outline-none border-b
                              text-[#333] placeholder:text-[#999]
                              text-[14px] sm:text-[16px] lg:text-[0.938vw]
                              py-[8px] lg:py-[0.417vw]
                              ${errors.name ? "border-[#ef493d]" : "border-[#33333322]"}`}
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                  {...register("name", {
                    required: "Please enter your name",
                    minLength: { value: 2, message: "Too short" },
                  })}
                />
                {errors.name && (
                  <p className="text-[#ef493d] text-[12px] mt-[4px]">{errors.name.message}</p>
                )}
              </div>

              <div>
                <div
                  className={`flex items-center gap-[8px] lg:gap-[0.417vw] w-full border-b
                              ${errors.phone ? "border-[#ef493d]" : "border-[#33333322]"}`}
                >
                  <CountryCodeSelect
                    {...register("countryCode", {
                      onChange: () => getValues("phone") && trigger("phone"),
                    })}
                    className="text-[#333] text-[14px] sm:text-[16px] lg:text-[0.938vw] py-[8px] lg:py-[0.417vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number*"
                    aria-invalid={!!errors.phone || undefined}
                    className="flex-1 min-w-0 bg-transparent outline-none border-none
                               text-[#333] placeholder:text-[#999]
                               text-[14px] sm:text-[16px] lg:text-[0.938vw]
                               py-[8px] lg:py-[0.417vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                    {...register("phone", {
                      required: "Please enter your phone",
                      validate: (v) => validatePhone(v, getValues("countryCode")),
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[#ef493d] text-[12px] mt-[4px]">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email Address*"
                  aria-invalid={!!errors.email || undefined}
                  className={`w-full bg-transparent outline-none border-b
                              text-[#333] placeholder:text-[#999]
                              text-[14px] sm:text-[16px] lg:text-[0.938vw]
                              py-[8px] lg:py-[0.417vw]
                              ${errors.email ? "border-[#ef493d]" : "border-[#33333322]"}`}
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                  {...register("email", {
                    required: "Please enter your email",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-[#ef493d] text-[12px] mt-[4px]">{errors.email.message}</p>
                )}
              </div>

              {askProject && (
                <div>
                  <div
                    className={`relative w-full border-b
                                ${errors.project ? "border-[#ef493d]" : "border-[#33333322]"}`}
                  >
                    <select
                      aria-label="Preferred project"
                      aria-invalid={!!errors.project || undefined}
                      defaultValue=""
                      className="w-full appearance-none bg-transparent outline-none border-none cursor-pointer
                                 text-[#333] text-[14px] sm:text-[16px] lg:text-[0.938vw]
                                 py-[8px] lg:py-[0.417vw] pr-[20px]"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                      {...register("project", { required: "Please select a project" })}
                    >
                      <option value="" disabled>
                        Preferred Project*
                      </option>
                      {projectOptions.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#999]"
                      strokeWidth={2}
                    />
                  </div>
                  {errors.project && (
                    <p className="text-[#ef493d] text-[12px] mt-[4px]">{errors.project.message}</p>
                  )}
                </div>
              )}

              <div>
                <input
                  type="date"
                  aria-label="Preferred visit date"
                  className="w-full bg-transparent outline-none border-b border-[#33333322]
                             text-[#333] placeholder:text-[#999]
                             text-[14px] sm:text-[16px] lg:text-[0.938vw]
                             py-[8px] lg:py-[0.417vw]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                  {...register("preferredDate")}
                />
              </div>

              {submitError && (
                <p className="text-[#ef493d] text-[13px]" role="alert">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group relative inline-flex items-center justify-center gap-[10px] lg:gap-[0.521vw]
                           whitespace-nowrap overflow-hidden mt-[6px] lg:mt-[0.521vw]
                           h-[46px] sm:h-[50px] lg:h-[2.917vw]
                           px-[24px] lg:px-[1.563vw]
                           bg-[#ef493d] text-white border border-[#ef493d]
                           transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                           hover:bg-transparent hover:text-[#ef493d]
                           disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span
                  className="font-montserrat font-medium capitalize
                             text-[14px] sm:text-[15px] lg:text-[0.938vw] tracking-[0.02em]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {submitting ? "Submitting…" : "Request Site Visit"}
                </span>
              </button>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
