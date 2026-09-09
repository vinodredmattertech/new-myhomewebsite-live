import Button from "@/components/layout/Button";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BsFillArrowRightCircleFill } from "react-icons/bs";
import { TypeAnimation } from "react-type-animation";
export default function Custom404() {
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        repeat: Infinity,
        repeatDelay: 1,
      },
    },
  };

  const letter = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="w-full h-[70vh] min-h-[520px]">
      <div className="relative w-full h-full ">
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
          {/* <Image
            src="/icons/bf.gif"
            alt="decor"
            width={1000}
            height={1000}
            className="lg:h-[7.229vw] h-[80px] w-auto"
          /> */}
        </div>

        <div className="text-center w-full h-full mx-auto lg:max-w-[80vw] flex flex-col items-center justify-center ">
          <div className="mt-5 heading-sub PPEditorialOld flex justify-center">
            <TypeAnimation
              sequence={["Page Not Found", 2000, "", 500]}
              speed={50}
              repeat={Infinity}
              wrapper="h1"
              className="mt-5 heading-sub PPEditorialOld text-[#BE9C58] text-center"
            />
          </div>
          <p className="content lg:w-[60vw] mx-auto w-[90vw]">
            Every delightful space begins with intention. <br /> This space is
            still under careful construction.
          </p>
          {/* Back link */}
          <div className="flex items-center lg:flex-row flex-col lg:gap-[2vw] gap-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-12 max-md:mt-7 flex justify-center"
            >
              <Link
                href="/"
                className="group inline-flex items-center gap-3  pb-1 Avenir text-[#1f1f1f] heading-md"
              >
                <Button variant="outline" title={"Return to Home"} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-12 max-md:mt-3 flex justify-center"
            >
              <Link
                href="/projects"
                className="group inline-flex items-center gap-3  pb-1 Avenir text-[#1f1f1f] heading-md"
              >
                <Button variant="outline" title={"Explore Our Projects"} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

Custom404.getLayout = (page) => (
  <MyHomeLayout title="Page Not Found | My Home Group">{page}</MyHomeLayout>
);
