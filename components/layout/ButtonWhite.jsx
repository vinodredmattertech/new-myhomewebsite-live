import React from "react";

const ButtonWhite = ({ 
  title, 
  onClick = () => {}, 
  variant = "primary" // "primary" | "outline"
}) => {
  // Base button classes
  const baseClasses = `
    relative group rounded-full overflow-hidden border
    lg:px-[1.146vw] lg:py-[0.350vw] px-3 py-2
    transition-colors duration-300 cursor-pointer
  `;

  // Variant styles
  const variantClasses = {
    primary: "bg-[#E12428] border-[#E12428] text-white",
    outline: "bg-transparent border-[#fff] text-[#fff]",
  };

  // Hover overlay colors for each variant
  const overlayClasses = {
    primary: "bg-[#F5F1EB]",
    outline: "bg-[#E12428]",
  };

  // Hover text color for each variant
  const hoverTextClasses = {
    primary: "group-hover:text-[#E12428]",
    outline: "group-hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {/* Hover overlay */}
      <span
        className={`
          absolute left-0 bottom-0 w-full h-0
          ${overlayClasses[variant]} 
          rounded-xl lg:rounded-[1.293vw]
          transition-all duration-300
          group-hover:h-full
          pointer-events-none
          z-0
        `}
      />

      {/* Button text */}
      <span
        className={`
          relative z-[0] font-medium montserrat capitalize content-sm
          transition-colors duration-300
          ${hoverTextClasses[variant]}
        `}
      >
        {title}
      </span>
    </button>
  );
};

export default ButtonWhite;
