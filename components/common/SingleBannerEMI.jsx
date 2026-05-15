import Image from "next/image";
import React from "react";
import { cleanImage } from "./ImageClear";

const SingleBannerEMI = ({ data }) => {
  console.log({ data });
  const { title, webBanner, mobileBnner } = data;
  return (
    <div className="lg:h-screen md:h-[75vh] h-[75vh] w-full overflow-hidden relative">
      <Image
        src={webBanner}
        alt="Web project Banner"
        width={1000}
        height={1000}
        className="w-full h-full lg:block object-cover hidden"
      />
      <Image
        src={mobileBnner}
        alt="mobile project Banner"
        width={1000}
        height={1000}
        className="w-full h-full lg:hidden object-cover block"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.00) 80.28%)",
        }}
      />
      <div className="absolute bottom-[10%] heading-sm lg:text-[1.25vw] lg:font-[400] font-[600] montserrat text-white left-[10%]">
        {title}
      </div>
    </div>
  );
};

export default SingleBannerEMI;
