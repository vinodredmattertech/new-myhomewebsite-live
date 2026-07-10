import React from "react";

const Button = ({ 
  title, 
  onClick = () => {}, 
  variant = "primary", // "primary" | "outline"
  type=false
}) => {
  // Base button classes
  const baseClasses = `
    relative group rounded-full overflow-hidden border
    lg:px-[1.146vw] lg:py-[0.350vw] px-3 py-2
    transition-colors duration-300 cursor-pointer
  `;

  // Variant styles
  const variantClasses = {
    primary: "bg-[#BE9C58] border-[#BE9C58] text-white",
    outline: "bg-transparent border-[#BE9C58] text-[#BE9C58]",
  };

  // Hover overlay colors for each variant
  const overlayClasses = {
    primary: "bg-[#F5F1EB]",
    outline: "bg-[#BE9C58]",
  };

  // Hover text color for each variant
  const hoverTextClasses = {
    primary: "group-hover:text-[#BE9C58]",
    outline: "group-hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      type={type && "submit"}
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
          relative flex items-center justify-center z-[0] font-medium montserrat capitalize content-sm
          transition-colors duration-300
          ${hoverTextClasses[variant]}
        `}
      >
        {title}
      </span>
    </button>
  );
};

export default Button;
