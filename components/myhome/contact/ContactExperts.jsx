import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Phone, Mail, Clock, MapPin, ArrowUpRight } from "lucide-react";
import SectionLabel from "@/components/myhome/SectionLabel";

const PHONE_ROWS = [
  { Icon: Phone, text: "Sales Enquiry: +91 99895 55777", href: "tel:+919989555777" },
  { Icon: Phone, text: "Alternative Sales Support: +91 91549 81691 / 92", href: "tel:+919154981691" },
  { Icon: Mail, text: "nri@myhomeconstructions.com", href: "mailto:nri@myhomeconstructions.com" },
  { Icon: Mail, text: "Marketing Support: mktg@myhomeconstructions.com", href: "mailto:mktg@myhomeconstructions.com" },
  { Icon: Clock, text: "Business Hours: Monday - Friday: 9:00 AM to 5:30 PM (IST)" },
];

const MAPS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=My+Home+Hub+Hitech+City+Madhapur+Hyderabad";

export default function ContactExperts() {
  const rootRef = useRef(null);
  const headingRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      const words = splitToWords(headingRef.current);
      gsap.from(words, {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 py-[60px] md:py-[80px] lg:pt-[4.687vw] lg:pb-[5.208vw]"
    >
      {/* vertical side label */}
      <div className="absolute left-[4.16vw] top-[4.687vw]">
        <SectionLabel>Start a Conversation</SectionLabel>
      </div>

      <div className="px-5 md:px-10 lg:px-[9.375vw]">
        {/* Large heading */}
        <h2
          ref={headingRef}
          className="text-[#333] capitalize will-change-transform leading-[1.05] tracking-[0.02em]
                     text-[34px] xs:text-[40px] sm:text-[52px] md:text-[64px] lg:text-[5vw]"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
            fontWeight: 300,
          }}
        >
          Connect with Our Experts
        </h2>

        <div className="mt-[40px] md:mt-[56px] lg:mt-[3.125vw] grid grid-cols-1 lg:grid-cols-2 gap-y-[40px] gap-x-[40px] lg:gap-x-[2.083vw] items-start">
          {/* ============= LEFT: contact info ============= */}
          <div className="flex flex-col gap-[40px] md:gap-[56px] lg:gap-[3.594vw]">
            {/* --- Direct Communication Channels --- */}
            <div className="flex flex-col gap-[18px] md:gap-[22px] lg:gap-[1.302vw]">
              <h3
                className="text-[#333] leading-[1.2]
                           text-[22px] sm:text-[26px] md:text-[30px] lg:text-[1.875vw]"
                style={{
                  fontFamily:
                    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                  fontWeight: 300,
                }}
              >
                Direct Communication Channels
              </h3>
              <div className="h-px w-full max-w-[604px] lg:w-[31.458vw] bg-[#33333322]" />

              <ul className="flex flex-col gap-[14px] md:gap-[18px] lg:gap-[1.094vw] mt-[6px] lg:mt-[0.521vw]">
                {PHONE_ROWS.map(({ Icon, text, href }, i) => (
                  <li key={i} className="flex items-start gap-[12px] lg:gap-[0.729vw]">
                    <Icon
                      className="shrink-0 mt-[3px] lg:mt-[0.26vw] text-[#ef493d]
                                 w-[18px] h-[18px] md:w-[20px] md:h-[20px] lg:w-[1.302vw] lg:h-[1.302vw]"
                      strokeWidth={1.6}
                    />
                    {href ? (
                      <a
                        href={href}
                        className="font-montserrat font-normal text-[#333] hover:text-[#ef493d] transition-colors
                                   text-[14px] sm:text-[16px] md:text-[18px] lg:text-[1.094vw]
                                   leading-[22px] sm:leading-[26px] md:leading-[28px] lg:leading-[1.614vw]"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {text}
                      </a>
                    ) : (
                      <span
                        className="font-montserrat font-normal text-[#333]
                                   text-[14px] sm:text-[16px] md:text-[18px] lg:text-[1.094vw]
                                   leading-[22px] sm:leading-[26px] md:leading-[28px] lg:leading-[1.614vw]"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {text}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* --- Corporate Address & Location --- */}
            <div className="flex flex-col gap-[18px] md:gap-[22px] lg:gap-[1.302vw]">
              <h3
                className="text-[#333] leading-[1.2]
                           text-[22px] sm:text-[26px] md:text-[30px] lg:text-[1.875vw]"
                style={{
                  fontFamily:
                    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                  fontWeight: 300,
                }}
              >
                Corporate Address &amp; Location
              </h3>
              <div className="h-px w-full max-w-[604px] lg:w-[31.458vw] bg-[#33333322]" />

              <div className="flex items-start gap-[12px] lg:gap-[0.729vw]">
                <MapPin
                  className="shrink-0 mt-[3px] lg:mt-[0.26vw] text-[#ef493d]
                             w-[18px] h-[18px] md:w-[20px] md:h-[20px] lg:w-[1.302vw] lg:h-[1.302vw]"
                  strokeWidth={1.6}
                />
                <p
                  className="font-montserrat font-normal text-[#333]
                             text-[14px] sm:text-[16px] md:text-[18px] lg:text-[1.094vw]
                             leading-[22px] sm:leading-[26px] md:leading-[28px] lg:leading-[1.614vw]
                             max-w-[565px] lg:w-[29.427vw]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  8th Floor, 3rd Block, My Home Hub, Hitech City, Madhapur, Hyderabad, Telangana &mdash; 500081
                </p>
              </div>
            </div>

            {/* --- Get Directions button --- */}
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-[10px] lg:gap-[0.521vw]
                         self-start whitespace-nowrap overflow-hidden
                         border border-[#ef493d] bg-transparent
                         transition-[border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                         w-[200px] sm:w-[220px] lg:w-[12.448vw]
                         h-[48px] sm:h-[54px] lg:h-[3.02vw]
                         px-[16px] lg:px-[1vw]"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom translate-y-full
                           group-hover:translate-y-0 transition-transform duration-500
                           ease-[cubic-bezier(0.22,1,0.36,1)] bg-[#ef493d]"
              />
              <span
                className="relative z-[1] font-montserrat font-medium capitalize
                           text-[#ef493d] group-hover:text-white transition-colors duration-500
                           text-[14px] sm:text-[15px] lg:text-[0.938vw] tracking-[0.02em]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Get Directions
              </span>
              <ArrowUpRight
                className="relative z-[1] text-[#ef493d] group-hover:text-white transition-colors duration-500
                           w-[16px] h-[16px] lg:w-[0.885vw] lg:h-[0.885vw]"
                strokeWidth={1.8}
              />
            </a>
          </div>

          {/* ============= RIGHT: map ============= */}
          <div
            className="relative w-full rounded-[10px] lg:rounded-[0.625vw] overflow-hidden
                       border border-[#3333331a] shadow-[0px_0px_10px_rgba(0,0,0,0.05)]
                       aspect-[734/701] lg:aspect-auto lg:h-[36.51vw] bg-[#f5f1eb]"
          >
            <iframe
              title="My Home Group corporate office location"
              src="https://www.google.com/maps?q=My+Home+Hub,+Hitech+City,+Madhapur,+Hyderabad,+Telangana+500081&z=16&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open in Google Maps"
              className="absolute right-[12px] top-[12px] lg:right-[0.833vw] lg:top-[0.833vw]
                         inline-flex items-center gap-[6px] lg:gap-[0.312vw]
                         px-[10px] py-[6px] lg:px-[0.677vw] lg:py-[0.416vw]
                         bg-white/95 backdrop-blur-sm border border-[#33333322]
                         rounded-[6px] lg:rounded-[0.312vw]
                         font-montserrat text-[#333] hover:text-[#ef493d] transition-colors
                         text-[11px] lg:text-[0.729vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              View larger map
              <ArrowUpRight
                className="w-[12px] h-[12px] lg:w-[0.625vw] lg:h-[0.625vw]"
                strokeWidth={1.8}
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
