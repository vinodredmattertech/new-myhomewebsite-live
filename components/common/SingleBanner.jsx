import Image from "next/image";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { cleanImage } from "./ImageClear";

const titleCase = (s = "") =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const SingleBanner = ({ data, icon }) => {

  // console.log(data, icon,  "Checking the data is Coming from the backend");
  const router = useRouter();

  const formattedSegments = useMemo(() => {
    const asPath = typeof router?.asPath === "string" ? router.asPath : "";
    const cleaned = asPath.split("?")[0];

    const segments = cleaned.split("/").filter((seg) => seg && seg !== "");

    return segments.map(titleCase);
  }, [router?.asPath]);

  const showRightIcon = router?.pathname === "/[slug]" || router?.pathname === "/loyalty-programme" || router?.pathname === "/channel-partner"; // more stable than route

  return (
    <div className="w-full lg:h-screen relative h-[70vh]">
      {/* Desktop banner */}
      <div className="w-full h-full relative lg:block hidden">
        <Image
          src={data?.WebBanner}
          alt="banner"
          height={1000}
          width={1000}
          className="w-full h-full object-cover"
          priority
        />
        {/* <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(0,0,0,0)_43.32%,rgba(0,0,0,0.36)_99.94%)]" /> */}
      </div>

      {/* Mobile banner */}
      <div className="w-full h-full relative block lg:hidden">
        <Image
          src={data?.MobileBanner}
          alt="banner"
          height={1000}
          width={1000}
          className="w-full h-full object-cover"
          priority
        />
        {/* <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(0,0,0,0)_43.32%,rgba(0,0,0,0.36)_99.94%)]" /> */}
      </div>

      {/* Title + Breadcrumb */}
      <div className="absolute left-[5%] lg:w-[35%] w-[80%] bottom-[10%]">
        <h1 className="lg:text-[3.646vw] md:text-[40px] text-[30px] text-white italic font-[400]">
          {data?.Title}
        </h1>

        <div className="flex items-center w-full gap-4 lg:gap-[1vw]">
          <span className="text-[17px] lg:text-[1.042vw] Avenir text-white font-[400]">
            Home
          </span>

          {formattedSegments.map((segment, index) => (
            <div
              key={`${segment}-${index}`}
              className="flex items-center gap-[0.625vw]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="7"
                height="12"
                viewBox="0 0 7 12"
                fill="none"
              >
                <path
                  d="M1.05469 11.3379C0.791016 11.3379 0.556641 11.25 0.380859 11.0742C0 10.7227 0 10.1074 0.380859 9.75586L4.39453 5.71289L0.380859 1.69922C0 1.34766 0 0.732422 0.380859 0.380859C0.732422 0 1.34766 0 1.69922 0.380859L6.38672 5.06836C6.76758 5.41992 6.76758 6.03516 6.38672 6.38672L1.69922 11.0742C1.52344 11.25 1.28906 11.3379 1.05469 11.3379Z"
                  fill="white"
                />
              </svg>

              <span className="text-[17px] lg:text-[1.042vw] Avenir text-white font-[400] capitalize">
                {segment}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Icon */}
      <div className="absolute right-[6%] lg:-bottom-[5%] -bottom-[9%]">
        {showRightIcon && icon?.data?.attributes?.url && (
          <div className="w-full h-full bg-white rounded-[12px] lg:py-[1vw] lg:px-[1vw] py-[10px] px-[10px]">
            <Image
              src={cleanImage(icon?.data?.attributes?.url)}
              alt="icon"
              height={1000}
              width={1000}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleBanner;
