"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const SectionCursor = ({ text, active, className = "lg:w-[8.5vw] lg:h-[8.5vw]" }) => {
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // smooth follow (THIS is the magic)
  const smoothX = useSpring(x, { stiffness: 120, damping: 20 });
  const smoothY = useSpring(y, { stiffness: 120, damping: 20 });

  useEffect(() => {
    document.body.style.cursor = active ? "pointer" : "";
    return () => { document.body.style.cursor = ""; };
  }, [active]);

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX - 40);
      y.set(e.clientY - 40);

      if (!visible) setVisible(true); // show only after first move
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [visible]);

  if (!active || !visible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[999999] pointer-events-none lg:block hidden"
      style={{
        x: smoothX,
        y: smoothY,
        cursor: "pointer",
      }}
    >
      <div className={`w-[80px] h-[80px] ${className} flex items-center justify-center rounded-full border border-[#BE9C58] bg-white/70 backdrop-blur !cursor-pointer`}>
        <h4 className="text-[14px] lg:text-[1vw] text-[#BE9C58] font-medium text-center break-words leading-tight px-2 max-w-[70%]">
          {text}
        </h4>
      </div>
    </motion.div>
  );
};

export default SectionCursor;