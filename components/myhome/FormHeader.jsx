import Image from "next/image";

/**
 * Header for the standalone form pages: just the logo, not linked anywhere,
 * in normal document flow so it scrolls away with the page. White, like the
 * page, so it uses the dark-text logo with a hairline beneath.
 */
const LOGO = "/assets/myhome/logo-dark.svg";

export default function FormHeader() {
  return (
    <header className="relative w-full bg-white border-b border-[#e5e2de]">
      <div className="h-[66px] md:h-[80px] lg:h-[5.77vw] flex items-center justify-center px-5">
        <Image
          src={LOGO}
          alt="My Home Group"
          width={137}
          height={72}
          priority
          unoptimized
          className="w-[70px] md:w-[100px] lg:w-[7.135vw] h-auto select-none"
        />
      </div>
    </header>
  );
}
