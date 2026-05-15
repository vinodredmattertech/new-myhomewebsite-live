import { ArrowRightIcon, ChevronRight, CornerUpRight, MoveRight, MoveRightIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import RightButton from '../layout/RightButton';

const Banner = () => {
  const data = [
    {
      image: '/images/pillar/Banner.jpg',
      title: "The Anatomy of Distinction",
      subtitle: ["Home", "Pillars of distinction"],
    },
  ];

  return (
    <div className='w-full relative'>
      {data.map((item, index) => (
        <div key={index} className="relative">
          <Image
            src={item?.image}
            alt='image'
            priority
            width={1920}
            height={900}
className="object-cover relative w-full lg:h-full h-[60vh] max-sm:h-[50vh]"          />

<div className="absolute bottom-[10%] left-[10%] w-[24.271vw] max-lg:left-4 max-lg:right-4 max-lg:w-auto max-lg:bottom-6">            <h2 className='italic tracking-tight  lg:leading-[5vw] heading-sm lg:text-[3.646vw] lg:font-[400] font-[600] PPEditorialOld text-white'>
              {item?.title}
            </h2>

<div className="flex flex-wrap items-center text-white gap-2 lg:gap-[1vw]">              {item.subtitle.map((crumb, idx) => (
                <React.Fragment key={idx}>
<span className="font-[500] content-des Avenir text-sm max-sm:text-xs lg:[1.042vw]">
  {crumb}
</span>                  {idx !== item.subtitle.length - 1&&(
                                      <svg className='shrink-0 max-sm:scale-90 text-[15px] lg:[0.781vw]' xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none">
<path d="M1.05469 11.3379C0.791016 11.3379 0.556641 11.25 0.380859 11.0742C0 10.7227 0 10.1074 0.380859 9.75586L4.39453 5.71289L0.380859 1.69922C0 1.34766 0 0.732422 0.380859 0.380859C0.732422 0 1.34766 0 1.69922 0.380859L6.38672 5.06836C6.76758 5.41992 6.76758 6.03516 6.38672 6.38672L1.69922 11.0742C1.52344 11.25 1.28906 11.3379 1.05469 11.3379Z" fill="white"/>
</svg>
                  )}

                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Banner;
