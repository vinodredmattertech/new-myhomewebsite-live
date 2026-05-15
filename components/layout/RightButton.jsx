import Image from "next/image";
import React from "react";

const RightButton = ({ white, name, black, red }) => {
  return (
    <button
      className={`${white && "white-filter"} ${black && "black-filter"} ${
        red && "red-filetr"
      } ${name} `}
    >
      <Image
        height={57}
        width={57}
        src={"/icons/swiper-btn.svg"}
        className={`  lg:size-[2.969vw]`}
      />
    </button>
  );
};

export default RightButton;
