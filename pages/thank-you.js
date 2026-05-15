import React from "react";
import { useRouter } from "next/router";
import { AiOutlineCheckCircle } from "react-icons/ai";
import Button from "@/components/layout/Button";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";

const ThankYou = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen  flex items-center justify-center bg-[#fff] text-white relative overflow-hidden">

              <div className="absolute left-0 bottom-0 lg:h-[40.635vw] h-[40vh]">
                <Image
                  src="/icons/left21.svg"
                  alt="left shape"
                  width={1000}
                  height={1000}
                  className="w-full h-full"
                />
              </div>
      
              {/* Right Shape */}
              <div className="absolute right-0 bottom-0 lg:h-[40.635vw] h-[40vh]">
                <Image
                  src="/icons/left22.svg"
                  alt="right shape"
                  width={1000}
                  height={1000}
                  className="w-full h-full"
                />
              </div>
      
              {/* Rotated GIF */}
              <div className="absolute left-[10%] lg:top-[40%] top-[60%] z-10 -rotate-90 mix-blend-multiply">
                <Image
                  src="/icons/bf.gif"
                  alt="decor"
                  width={1000}
                  height={1000}
                  className="lg:h-[7.229vw] h-[80px] w-auto"
                />
              </div>
      <div className="relative z-1 lg:max-w-[70vw] max-w-[90vw] w-full text-center px-6 py-12  ">
        <Image
          src={"/icons/success.gif"}
          width={1000}
          height={1000}
          className="h-[100px] mx-auto w-[100px] mb-6"
        />

        <div className="mt-5 heading-sub PPEditorialOld flex justify-center">
          {/* <TypeAnimation
            sequence={["Thank You!", 1500, "", 500]}
            speed={50}
            repeat={Infinity}
            wrapper="h1"
            className="mt-5 heading-sub PPEditorialOld text-[#BE9C58] text-center"
          /> */}
          <h1  className="mt-5 heading-sub PPEditorialOld text-[#BE9C58] text-center">
Thank You!
          </h1>
        </div>

        <p className="text-[#000] capitalize  text-lg mb-8 OutfitRegular">
          Thank you for reaching out to us about the project! <br /> We have received
          your message regarding your inquiry and will get back to you as soon
          as possible. <br /> Your inquiry is important to us, and we appreciate your
          patience.
        </p>

        <div className="flex justify-center w-full items-center">
          <div onClick={() => router.back()} className=" w-auto">
            <Button title={"Back to Home"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
