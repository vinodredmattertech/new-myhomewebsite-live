import Image from "next/image";
import React, { useEffect, useState } from "react";
import axios from "axios";
import qs from "qs";
import { MdKeyboardArrowRight } from "react-icons/md";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";
import { FaPhoneAlt, FaWhatsapp, FaArrowRight } from "react-icons/fa";
import EnquireModal from "../common/EnquireForm";
import { useRouter } from "next/router";



// CMS entries can be saved without a URL, and next/link throws when `href` is
// undefined. Render those as plain text instead of a dead link.
const FooterLink = ({ href, className, children }) =>
  href ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <span className={className}>{children}</span>
  );

const iconMap = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  youtube: FaYoutube,
  twitter: FaXTwitter,
  linkedin: FaLinkedinIn,
};

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const router = useRouter();

  useEffect(() => {
    const isProjectPage = router.pathname === "/[slug]";
    if (isProjectPage && router.query.url) {
      axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/projects?filters[slug][$eq]=${router.query.url}&fields[0]=Title`)
        .then((res) => {
          const title = res.data?.data?.[0]?.attributes?.Title;
          if (title) setProjectTitle(title);
        })
        .catch(() => { });
    } else {
      setProjectTitle("");
    }
  }, [router.pathname, router.query.url]);

  const [showStrap, setShowStrap] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollTimeout, setScrollTimeout] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Only proceed if scroll position is greater than 500px
      if (currentScrollY > 500) {
        // If scroll position has changed from the last scroll position
        // if (currentScrollY !== lastScrollY) {
        //   // Clear the previous timeout as scroll has resumed
        //   if (scrollTimeout) {
        //     clearTimeout(scrollTimeout);
        //   }
        //   // Reset showStrap to false immediately when scrolling occurs
        //   setShowStrap(false);
        //   // Set a new timeout to show the strap after 2 seconds of inactivity
        //   const newTimeout = setTimeout(() => {
        //     setShowStrap(true);
        //   }, 1000);
        //   setScrollTimeout(newTimeout);
        // }
        setShowStrap(true);
      } else {
        // If scroll position is less than 500px, hide the strap
        setShowStrap(false);
      }
      // Update the last scroll position
      setLastScrollY(currentScrollY);
    };
    // Add the scroll event listener
    window.addEventListener("scroll", handleScroll);
    // Cleanup event listener and timeout on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout); // Clean up any existing timeout on unmount
      }
    };
  }, [lastScrollY, scrollTimeout]);


  console.log({ footerData });
  useEffect(() => {
    const fetchFooter = async () => {
      const query = {
        populate: [
          "projects",
          "Typology",
          "quickLinks",
          "bottomLinks",
          "FooterLogo",
          "socialLinks",
        ],
      };

      const queryString = qs.stringify(query, { encodeValuesOnly: true });

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/footer?${queryString}`,
        );
        setFooterData(res.data?.data?.attributes);
        console.log(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchFooter();
  }, []);

  if (!footerData) return null;

  // The logo relation can be absent from the CMS response. Building the src
  // unconditionally would stringify `undefined` into the URL and blow up
  // next/image, so resolve it first and skip the <Image> when there is none.
  const footerLogoPath = footerData?.FooterLogo?.data?.attributes?.url;
  const footerLogoSrc = footerLogoPath
    ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${footerLogoPath}`
    : null;

  return (
    <footer className=" relative">

      {showStrap && <div className="fixed bottom-5 md:bottom-20 left-1/2 -translate-x-1/2 z-50">

        <div className="flex items-center gap-6 bg-white border border-blue-300 rounded-full px-6 py-3 shadow-lg">

          {/* Call */}
          <Link
            href="tel:+919154981691"
            className="flex items-center gap-2 text-gray-800 hover:text-black"
          >
            <FaPhoneAlt />
            <span className="text-sm lg:text-base font-medium">Call</span>
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-300"></div>

          {/* WhatsApp */}
          <Link
            href="https://wa.me/message/9730571775"
            target="_blank"
            className="flex items-center gap-2 text-gray-800 hover:text-black"
          >
            <FaWhatsapp />
            <span className="text-sm lg:text-base font-medium">WhatsApp</span>
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-300"></div>

          {/* Enquire */}
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-gray-800 hover:text-black">
            <span className="text-sm lg:text-base font-medium">Enquire</span>
            <FaArrowRight />
          </button>

        </div>
      </div>}



      <div className="absolute lg:block hidden lg:left-[0%] left-[0%] top-[0%]  lg:z-auto z-[9999] ">
        <Image
          src={"/icons/bg11.png"}
          height={1000}
          width={1000}
          alt="flw"
          className="w-auto lg:h-[26.042vw] h-[500px]"
        />
      </div>

      <div className="absolute lg:block hidden lg:right-[0%] right-[0%] top-[0%]  lg:z-auto z-[9999] ">
        <Image
          src={"/icons/bg12.png"}
          height={1000}
          width={1000}
          alt="flw"
          className="w-auto lg:h-[26.042vw] h-[500px]"
        />
      </div>

      {/* Logo */}
      {footerLogoSrc && (
        <div className=" flex items-center justify-center">
          <Image
            src={footerLogoSrc}
            alt={footerData?.FooterLogo?.data?.attributes?.alternativeText || "Logo"}
            width={268}
            height={147}
            priority
            className="h-[126px] w-auto lg:h-[7.604vw]"
          />
        </div>
      )}

      {/* Divider */}
      <div className=" h-[1px]  bg-[#5F5F5F80] my-10 lg:my-[2vw]   lg:max-w-[80vw] max-w-[90%] mx-auto" />

      {/* Content */}
      <div className="grid lg:grid-cols-[50%,20%,15%,15%] grid-cols-1 gap-5 lg:gap-2 containery   lg:max-w-[80vw] max-w-[90%] mx-auto ">
        {/* Reach Us */}
        <div>
          <h3 className="text-[#7B766C] lg:text-[1.302vw] text-[25px] font-[400] Avenir italic lg:mb-[1vw] mb-4">
            Reach Us
          </h3>

          <ul className="space-y-2 lg:space-y-[0.7vw] lg:text-[0.833vw] text-[16px] text-[#5F5F5F] Avenir">
            <li>
              <span className="text-[#C6A664] font-[500]">Tel:</span>{" "}
              <a
                href={`tel:${footerData.tel}`}
                className="hover:text-[#2E2E2E]"
              >
                {footerData.tel}
              </a>
            </li>

            <li>
              <span className="text-[#C6A664] font-[500]">Board Line:</span>{" "}
              <a
                href={`tel:${footerData.phone}`}
                className="hover:text-[#2E2E2E]"
              >
                {footerData.phone}
              </a>
            </li>

            <li>
              <span className="text-[#C6A664] font-[500]">Email:</span>{" "}
              <a
                href={`mailto:${footerData.email}`}
                className="hover:text-[#2E2E2E]"
              >
                {footerData.email}
              </a>
            </li>

            <li className="leading-relaxed lg:w-[40%]">
              <span className="text-[#C6A664]  font-[500]">Add:</span>{" "}
              {footerData.address}
            </li>
          </ul>
          {/* Social Icons */}
          <div className="flex gap-4 mt-6">
            <div className="flex gap-4 mt-6">
              {footerData?.socialLinks?.map((item) => {
                const Icon = iconMap[item.name.toLowerCase()];
                if (!Icon) return null;

                return (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-[#C6A664] text-[#C6A664] hover:bg-[#C6A664] hover:text-black transition"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        {/* Quick Links */}
        <div>
          <h3 className="text-[#7B766C] lg:text-[1.302vw] text-[25px] font-[400] Avenir italic lg:mb-[1vw] mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2 lg:space-y-[0.7vw] lg:text-[0.833vw] text-[16px] text-[#5F5F5F] Avenir">
            {footerData?.quickLinks?.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <MdKeyboardArrowRight className="text-[#BE9C58]" />
                <FooterLink href={item.link}>{item.name}</FooterLink>
              </li>
            ))}
          </ul>
        </div>
        {/* Projects */}
        <div>
          <h3 className="text-[#7B766C] lg:text-[1.302vw] text-[25px] font-[400] Avenir italic lg:mb-[1vw] mb-4">
            Projects
          </h3>
          <ul className="space-y-2 lg:space-y-[0.7vw] lg:text-[0.833vw] text-[16px] text-[#5F5F5F] Avenir">
            {footerData?.projects?.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <MdKeyboardArrowRight className="text-[#BE9C58]" />
                <FooterLink href={item.link}>{item.name}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-[#7B766C] lg:text-[1.302vw] text-[25px] font-[400] Avenir italic lg:mb-[1vw] mb-4">
            Typology
          </h3>
          <ul className="space-y-2 lg:space-y-[0.7vw] lg:text-[0.833vw] text-[16px] text-[#5F5F5F] Avenir">
            {footerData?.Typology?.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <MdKeyboardArrowRight className="text-[#BE9C58]" />
                <FooterLink href={item.link}>{item.name}</FooterLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className=" h-[1px]  bg-[#5F5F5F80] my-10 lg:my-[2vw]  lg:max-w-[80vw] max-w-[90%] mx-auto" />

      {/* Bottom */}
      <div className="">
        <div className="lg:max-w-[80vw] mx-auto pb-10 md:pb gap-5 md:gap-0   my-10 lg:my-[2vw] flex flex-col lg:flex-row justify-between items-center text-xs text-[#8A8A8A] gap-2">
          <p className="lg:text-[0.833vw] text-[16px] text-[#5F5F5F] Avenir">
            © 2026 Pristine Properties. All Rights Reserved.
          </p>
          <p className="text-center  flex items-center gap-2 font-[400] content lg:text-[0.833vw] text-[16px]  Avenir tracking-[2px] text-[#5F5F5F]">
            Created BY{" "}
            <a
              href="https://realatte.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="8"
                viewBox="0 0 20 8"
                fill="none"
              >
                <path
                  d="M20 8H15.2108C14.6202 8 14.133 7.82471 13.7677 7.48017L10.7201 4.74802C10.6257 4.6513 10.5282 4.55761 10.4186 4.4609C10.306 4.36721 10.2085 4.24934 10.1172 4.11636C10.0198 4.25236 9.92235 4.36721 9.8097 4.4609C9.7001 4.55761 9.60269 4.6513 9.50221 4.74802L6.39976 7.48017C6.25058 7.61617 6.04353 7.73706 5.7817 7.84284C5.52291 7.9456 5.24585 8 4.95965 8H0L6.64333 0H13.3628L19.997 8H20Z"
                  fill="#DE0A83"
                />
              </svg>
              Realatte
            </a>
          </p>
          <div className="flex gap-4  lg:gap-[4vw] lg:text-[0.833vw] text-[16px] text-[#5F5F5F] Avenir">
            {footerData?.bottomLinks?.map((item) => (
              <FooterLink
                key={item.id}
                href={item.link}
                className="hover:text-[#2E2E2E]"
              >
                {item.name}
              </FooterLink>
            ))}
          </div>
        </div>
      </div>

      <EnquireModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalTitle={projectTitle ? `Enquire Now in "${projectTitle}"` : "Enquire Now"}
        projectName={projectTitle || "-"}
        formSource="Bottom Bar form"
        type="general"
        
      />
    </footer>
  );
};

export default Footer;
