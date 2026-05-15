"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import SideBar from "./SideBar";
import qs from "qs";
import axios from "axios";
import { AnimatePresence } from "framer-motion";

const Header = () => {
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedScrollY, setSavedScrollY] = useState(0);

  const [isSticky, setIsSticky] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [isEnquireModalOpen, setEnquireModalOpen] = useState(false);
  const [enquireModalHeading, setEnquireModalHeading] = useState("Enquire Now");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ------------------ SCROLL HEADER LOGIC ------------------ */
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsSticky(currentY > 50);
      setVisible(currentY < lastScrollY);
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  /* ------------------ SIDEBAR TOGGLE (NO SCROLL JUMP) ------------------ */
  const toggleSidebar = () => {
    if (!isSidebarOpen) {
      const currentScroll = window.scrollY;
      setSavedScrollY(currentScroll);

      document.body.style.position = "fixed";
      document.body.style.top = `-${currentScroll}px`;
      document.body.style.width = "100%";
    } else {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      window.scrollTo(0, savedScrollY);
    }

    setIsSidebarOpen((prev) => !prev);
  };

  /* ------------------ ENQUIRE MODAL ------------------ */
  const handleCloseEnquireModal = () => {
    setEnquireModalOpen(false);
  };


  const rout = ["/thank-you","/404"];


  /* ------------------ JSX ------------------ */
  return (
    <header
      className={`fixed top-0 left-0 border-b border-[#FFFFFF] w-full z-[999] transition-all duration-300
        ${
          isSticky ?
            "bg-[#000000ab] shadow-md py-[0.6rem] lg:py-[0.5vw]"
          : ` ${rout.includes(router.pathname) ?"bg-[#000000ab]": "bg-transparent" }  py-[1.25rem] lg:py-[0.5vw]`
        }
        ${visible ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="max-w-[90vw] mx-auto flex items-center justify-between">
        {/* LOGO */}
        <div
          className="flex items-center cursor-pointer h-[70px] w-auto lg:h-[4.896vw] overflow-hidden"
          onClick={() => {
            router.push("/");
          }}
        >
          {" "}
          <Image
            src="/icons/logo.svg"
            alt="Logo"
            width={1000}
            height={1000}
            priority
            className="h-[70px] w-auto lg:h-[4.896vw] "
          />{" "}
        </div>
        {/* MENU BUTTON */}
        <div
          onClick={toggleSidebar}
          className="flex items-center gap-2 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="34"
            height="34"
            className="lg:h-[1.771vw] lg:w-[1.771vw]"
            viewBox="0 0 34 34"
            fill="none"
          >
            <path
              d="M2.81079 8.42515C2.81079 7.6522 3.43758 7.02682 4.20913 7.02682H15.4661C15.837 7.02682 16.1926 7.17414 16.4549 7.43638C16.7171 7.69862 16.8644 8.05429 16.8644 8.42515C16.8644 8.79602 16.7171 9.15169 16.4549 9.41393C16.1926 9.67617 15.837 9.82349 15.4661 9.82349H4.20913C3.83827 9.82349 3.48259 9.67617 3.22035 9.41393C2.95812 9.15169 2.81079 8.79602 2.81079 8.42515ZM2.81079 16.8644C2.81079 16.0914 3.43758 15.466 4.20913 15.466H29.5197C29.8906 15.466 30.2463 15.6134 30.5085 15.8756C30.7707 16.1378 30.9181 16.4935 30.9181 16.8644C30.9181 17.2352 30.7707 17.5909 30.5085 17.8531C30.2463 18.1154 29.8906 18.2627 29.5197 18.2627H4.20913C3.83827 18.2627 3.48259 18.1154 3.22035 17.8531C2.95812 17.5909 2.81079 17.2352 2.81079 16.8644ZM4.20913 23.9052C3.83827 23.9052 3.48259 24.0526 3.22035 24.3148C2.95812 24.577 2.81079 24.9327 2.81079 25.3036C2.81079 25.6744 2.95812 26.0301 3.22035 26.2923C3.48259 26.5546 3.83827 26.7019 4.20913 26.7019H21.0875C21.4584 26.7019 21.8141 26.5546 22.0763 26.2923C22.3386 26.0301 22.4859 25.6744 22.4859 25.3036C22.4859 24.9327 22.3386 24.577 22.0763 24.3148C21.8141 24.0526 21.4584 23.9052 21.0875 23.9052H4.20913Z"
              fill="white"
            />
          </svg>
          <span className="text-white Avenir content lg:block hidden !font-normal">MENU</span>
        </div>
      </div>

      {/* SIDEBAR */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <SideBar
            key="sidebar"
            toggleSidebar={toggleSidebar}
            data={data?.attributes?.ListingData}
          />
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
