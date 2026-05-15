import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { cleanImage } from "../common/ImageClear";

gsap.registerPlugin(ScrollTrigger);

const Banner = ({ data }) => {
  const containerRef = useRef(null);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full lg:h-screen overflow-hidden flex justify-center items-center"
    >
      <div className="lg:block md:hidden hidden h-full w-full">
        <video
          className="h-full w-full object-cover"
          src={cleanImage(data?.WebBanner?.data?.attributes?.url)}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      <div className="lg:hidden md:block block h-full w-full">
        <video
          className="h-full w-full object-cover"
          src={cleanImage(data?.mobileBanner?.data?.attributes?.url)}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    </div>
  );
};

export default Banner;
