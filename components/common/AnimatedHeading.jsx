import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const AnimatedHeading = ({
  text,
  as: Tag = "h2",
  className = "",
  once = false,
  stagger = 0.15,
  italic,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.3 });

  const words = text?.split("  ");

  return (
    <Tag ref={ref} className={`overflow-hidden ${className}`}>
      {words?.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={
            isInView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 30, filter: "blur(10px)" }
          }
          transition={{
            duration: 0.8,
            delay: index * stagger,
            ease: "easeOut",
          }}
          className={`inline-block  PPEditorialOld mr-2`}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
};

export default AnimatedHeading;
