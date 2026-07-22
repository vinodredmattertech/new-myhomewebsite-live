import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { GrClose } from "react-icons/gr";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import qs from "qs";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";


const iconMap = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  youtube: FaYoutube,
  twitter: FaXTwitter,
  linkedin: FaLinkedinIn,
};



export const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.5,
    },
  },
};

export const itemFadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const sidebarVariants = {
  hidden: {
    y: "-100%",
  },
  show: {
    y: 0,
    transition: {
      duration: 1, // smoother
      ease: [0.76, 0, 0.24, 1],
    },
  },
  exit: {
    y: "-100%",
    transition: {
      duration: 1,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

const ABOUT_SUBMENU = [
  { name: "About Us", link: "/about-us" },
  { name: "Our Story", link: "/pillar" },
  { name: "Testimonials", link: "/testimonials" },
  { name: "CSR", link: "/csr" },
  { name: "Awards", link: "/awards" },
];

const dropdownVariants = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

const SPECIALIST_TITLES = ["Customer Experience", "NRI Support Desk", "Vendor Helpdesk"];

const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const SideBar = ({
  toggleSidebar,
  data = [
    { id: 1, name: "Home", link: "/" },
    { id: 2, name: "About", link: "/about-us" },
    { id: 3, name: "Projects", link: "/projects" },
    { id: 4, name: "Contact", link: "/contact-us" },
    { id: 5, name: "Careers", link: "/careers" },
    { id: 6, name: "Projects", link: "/projects" },
    { id: 7, name: "Blogs", link: "/blogs" },
    { id: 8, name: "News & Media", link: "/news" },
  ],
}) => {
  const router = useRouter();
  const [Header, setHeader] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const fetchHeader = async () => {
      const query = { populate: ["mapList", "socialLinks"] };
      const queryString = qs.stringify(query, { encodeValuesOnly: true });
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/header?${queryString}`
        );
        setHeader(res.data?.data?.attributes);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchContact = async () => {
      const query = {
        populate: [
          "overview",
          "cards",
          "cards.mapList",
        ],
      };
      const queryString = qs.stringify(query, { encodeValuesOnly: true });
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/contact-page?${queryString}`
        );
        setContactData(res.data?.data?.attributes);
      } catch (error) {
        console.error(error);
      }
    };

    fetchHeader();
    fetchContact();
  }, []);

  if (!Header) return null;

  const primaryOffice = contactData?.overview?.[0] || null;
  const specialists = (contactData?.cards?.mapList || []).filter((c) =>
    SPECIALIST_TITLES.some((t) => c.title?.toLowerCase().includes(t.toLowerCase()))
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black h-screen"
      variants={sidebarVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[15vh] flex items-center border-b justify-between px-6 !pl-0 bg-[#F9F7F4]">
        <Image
          src="/icons/logoFooter.svg"
          alt="Logo"
          width={200}
          height={80}
          priority
          className="lg:h-[4.896vw] h-[100px] max-sm:h-[60px]"
        />
        <button onClick={toggleSidebar}>
          <GrClose className="h-6 w-6 text-black cursor-pointer" />
        </button>
      </div>

      {/* Menu */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="h-screen pt-[15vh] bg-[#F9F7F4] flex overflow-y-scroll max-sm:pt-[9rem]"
      >
        {/* LEFT – Navigation */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-12 lg:px-24 max-sm:justify-start max-sm:gap-[11px]">
          {Header?.mapList?.length > 0 &&
            Header?.mapList?.map((item, index) => {
              const isAbout = item.name?.toLowerCase() === "about";
              const isOpen = openDropdown === item.id;

              return (
                <motion.div
                  key={item.id}
                  variants={itemFadeUp}
                  className="overflow-hidden"
                >
                  {/* ── Item Row ── */}
                  <div
                    className="group block max-sm:py-0 py-3 lg:py-[0.5vw] cursor-pointer"
                    onClick={() => {
                      if (isAbout) {
                        setOpenDropdown(isOpen ? null : item.id);
                      } else {
                        router.push(item.link);
                        toggleSidebar();
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 lg:gap-[1vw]">
                        <span className="text-[#BE9C58] text-sm tracking-widest">
                          0{index + 1}
                        </span>
                        <motion.h2
                          className="text-[#BE9C58] text-[15px] lg:text-xl uppercase font-extralight tracking-[6px]"
                          whileHover={{ x: 12, letterSpacing: "10px" }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          {item.name}
                        </motion.h2>
                      </div>

                      {/* Arrow for About */}
                      {isAbout && (
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-[#BE9C58] text-lg"
                        >
                          &#8964;
                        </motion.span>
                      )}
                    </div>

                    {/* Underline */}
                    <motion.div
                      className="h-px bg-white/30 mt-4 w-0 group-hover:w-full"
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>

                  {/* ── Dropdown Submenu ── */}
                  {isAbout && (
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                          className="overflow-hidden pl-10 lg:pl-[3vw]"
                        >
                          {ABOUT_SUBMENU.map((sub, i) => (
                            <Link
                              key={i}
                              href={sub.link}
                              onClick={toggleSidebar}
                              className="flex items-center gap-3 py-2 lg:py-[0.35vw] group/sub"
                            >
                              <span className="w-1 h-1 rounded-full bg-[#BE9C58] shrink-0" />
                              <span className="text-[#BE9C58] Avenir text-sm lg:text-[0.833vw] font-light tracking-[3px] uppercase group-hover/sub:tracking-[5px] transition-all duration-300">
                                {sub.name}
                              </span>
                            </Link>
                          ))}
                          <div className="h-px bg-white/20 mt-2 mb-[60px] lg:mb-[0.4vw]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </motion.div>
              );
            })}
        </div>

        {/* RIGHT – Contact Info Card */}
        <div className="hidden lg:flex w-1/2 items-center justify-center">
          <div className="flex flex-col items-center w-full">
            <motion.div
              variants={slideFromRight}
              className="lg:w-[75%] glass bg-white/20 rounded-[16px] shadow-lg border border-white/30 overflow-hidden"
            >

              {/* ── LOCATION SECTION ── */}
              {primaryOffice && (
                <motion.div variants={slideFromRight} className="p-6 lg:p-[1.5vw]">
                  <p className="text-[#BE9C58] Avenir uppercase tracking-[3px] text-[11px] lg:text-[0.625vw] mb-4 lg:mb-[0.8vw]">
                    Our Office
                  </p>

                  <div className="space-y-3 lg:space-y-[0.6vw]">
                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 lg:w-[0.9vw] lg:h-[0.9vw] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none">
                        <path d="M13.2575 17.494C12.9197 17.819 12.4692 18.0005 12.0005 18.0005C11.5318 18.0005 11.0813 17.819 10.7435 17.494C7.65448 14.501 3.51548 11.158 5.53348 6.304C6.62648 3.679 9.24648 2 12.0005 2C14.7545 2 17.3755 3.68 18.4675 6.304C20.4835 11.151 16.3545 14.511 13.2575 17.494Z" stroke="#BE9C58" strokeWidth="1.5"/>
                        <path d="M14.5 9C14.5 10.3807 13.3807 11.5 12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9Z" stroke="#BE9C58" strokeWidth="1.5"/>
                      </svg>
                      <div
                        className="text-[#5F5F5F] Avenir text-[13px] lg:text-[0.729vw] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: primaryOffice.address }}
                      />
                    </div>

                    {/* Email */}
                    {primaryOffice.email && (
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 lg:w-[0.9vw] lg:h-[0.9vw] shrink-0" viewBox="0 0 24 24" fill="none">
                          <path d="M2 6L8.913 9.917C11.462 11.361 12.538 11.361 15.087 9.917L22 6" stroke="#BE9C58" strokeWidth="1.5" strokeLinejoin="round"/>
                          <path d="M2.017 13.476C2.082 16.541 2.115 18.074 3.246 19.209C4.377 20.345 5.951 20.384 9.1 20.463C11.04 20.513 12.962 20.513 14.902 20.463C18.051 20.384 19.625 20.345 20.756 19.209C21.887 18.074 21.92 16.541 21.986 13.476C22.006 12.49 22.006 11.51 21.986 10.524C21.92 7.459 21.887 5.926 20.756 4.791C19.625 3.655 18.051 3.616 14.902 3.537C12.968 3.488 11.034 3.488 9.1 3.537C5.951 3.616 4.377 3.655 3.246 4.791C2.115 5.926 2.082 7.459 2.017 10.524C1.995 11.508 1.995 12.492 2.017 13.476Z" stroke="#BE9C58" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                        <a href={`mailto:${primaryOffice.email}`} className="text-[#5F5F5F] Avenir text-[13px] lg:text-[0.729vw] hover:text-[#BE9C58] transition-colors">
                          {primaryOffice.email}
                        </a>
                      </div>
                    )}

                    {/* Tel */}
                    {primaryOffice.phone && (
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 lg:w-[0.9vw] lg:h-[0.9vw] shrink-0" viewBox="0 0 24 24" fill="none">
                          <path d="M15.6005 14.522C13.2055 17.042 7.09652 10.988 9.50052 8.45799C10.9685 6.91299 9.31052 5.14799 8.39252 3.84899C6.66952 1.41399 2.88852 4.77599 3.00252 6.91499C3.36552 13.661 10.6625 21.655 17.7285 20.957C19.9385 20.739 22.4785 16.747 19.9435 15.288C18.6755 14.558 16.9345 13.118 15.6005 14.521" stroke="#BE9C58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <a href={`tel:${primaryOffice.phone.replace(/\s+/g, "")}`} className="text-[#5F5F5F] Avenir text-[13px] lg:text-[0.729vw] hover:text-[#BE9C58] transition-colors">
                          {primaryOffice.phone}
                        </a>
                      </div>
                    )}

                    {/* Business Hours */}
                    {primaryOffice.hours && (
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 lg:w-[0.9vw] lg:h-[0.9vw] shrink-0" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="9" stroke="#BE9C58" strokeWidth="1.5"/>
                          <path d="M12 7V12L15 15" stroke="#BE9C58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[#5F5F5F] Avenir text-[13px] lg:text-[0.729vw]">
                          {primaryOffice.hours}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── DIVIDER ── */}
              {primaryOffice && specialists.length > 0 && (
                <div className="h-px bg-[#E8E2D8] mx-6 lg:mx-[1.5vw]" />
              )}

              {/* ── DIRECT ACCESS TO SPECIALIST SECTION ── */}
              {specialists.length > 0 && (
                <motion.div variants={slideFromRight} className="p-6 lg:p-[1.5vw]">
                  <p className="text-[#BE9C58] Avenir uppercase tracking-[3px] text-[11px] lg:text-[0.625vw] mb-4 lg:mb-[0.8vw]">
                    Direct Access to Specialist
                  </p>

                  <div className="space-y-4 lg:space-y-[0.8vw]">
                    {specialists.map((card, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <p className="text-[#333] Avenir font-medium text-[13px] lg:text-[0.729vw]">
                          {card.title}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {card.email && (
                            <a
                              href={`mailto:${card.email}`}
                              className="flex items-center gap-1.5 text-[#5F5F5F] Avenir text-[12px] lg:text-[0.677vw] hover:text-[#BE9C58] transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 lg:w-[0.75vw] lg:h-[0.75vw] shrink-0" viewBox="0 0 21 21" fill="none">
                                <path d="M15.9688 3.71875H5.03125C3.5815 3.71875 2.40625 4.894 2.40625 6.34375V14.6562C2.40625 16.106 3.5815 17.2812 5.03125 17.2812H15.9688C17.4185 17.2812 18.5938 16.106 18.5938 14.6562V6.34375C18.5938 4.894 17.4185 3.71875 15.9688 3.71875Z" stroke="#BE9C58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2.40625 7L9.76937 10.3828C9.99855 10.488 10.2478 10.5426 10.5 10.5426C10.7522 10.5426 11.0014 10.488 11.2306 10.3828L18.5938 7" stroke="#BE9C58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {card.email}
                            </a>
                          )}
                          {card.phone && (
                            <a
                              href={`tel:${card.phone.replace(/\s+/g, "")}`}
                              className="flex items-center gap-1.5 text-[#5F5F5F] Avenir text-[12px] lg:text-[0.677vw] hover:text-[#BE9C58] transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 lg:w-[0.75vw] lg:h-[0.75vw] shrink-0" viewBox="0 0 21 21" fill="none">
                                <path d="M6.85027 14.1496C4.9685 12.2642 3.52134 9.9904 2.61002 7.48733C2.10864 6.11883 2.56802 4.61558 3.59877 3.58483L4.23664 2.94783C4.59063 2.59384 5.06944 2.39453 5.56845 2.39453C6.06746 2.39453 6.54627 2.59384 6.90026 2.94783L8.34389 4.44146C8.69788 4.79545 8.89719 5.27426 8.89719 5.77327C8.89719 6.27228 8.69788 6.75109 8.34389 7.10508L7.97639 7.47258C7.82929 7.61965 7.7126 7.79426 7.63299 7.98643C7.55338 8.1786 7.5124 8.38457 7.5124 8.59258C7.5124 8.80059 7.55338 9.00657 7.63299 9.19874C7.7126 9.39091 7.82929 9.56551 7.97639 9.71258L11.3364 13.0235C11.6357 13.3228 12.0399 13.4874 12.4564 13.4874C12.8729 13.4874 13.2771 13.3228 13.5764 13.0235L13.9448 12.656C14.2988 12.302 14.7776 12.1027 15.2766 12.1027C15.7756 12.1027 16.2544 12.302 16.6084 12.656L18.052 14.1496C18.406 14.5036 18.6053 14.9824 18.6053 15.4814C18.6053 15.9804 18.406 16.4592 18.052 16.8132L17.415 17.4002C16.3843 18.4318 14.881 18.8912 13.5125 18.3898C11.0094 17.4785 8.73569 16.0314 6.85027 14.1496Z" stroke="#BE9C58" strokeWidth="1.5" strokeLinejoin="round"/>
                              </svg>
                              {card.phone}
                            </a>
                          )}
                        </div>
                        {i < specialists.length - 1 && (
                          <div className="h-px bg-[#F0EBE3] mt-2 lg:mt-[0.4vw]" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
            {/* ── END CARD ── */}

            {/* Social Icons */}
            <motion.div variants={slideFromRight} className="flex gap-4 mt-5 lg:mt-[1vw]">
              {Header?.socialLinks?.map((item) => {
                const Icon = iconMap[item.name.toLowerCase()];
                if (!Icon) return null;
                return (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-[#C6A664] text-[#C6A664] hover:bg-[#C6A664] hover:text-black transition"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SideBar;
