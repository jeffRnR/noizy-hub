import React, { MouseEventHandler, ReactNode } from "react";
import ButtonSvg from "./ui/svg/ButtonSvg";

interface ButtonProps {
  className?: string;
  href?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
  px?: string;
  white?: boolean;
}

const Button: React.FC<ButtonProps> = ({ className, onClick, disabled, children, px, white }) => {
  const classes = `button relative inline-flex flex flex-row items-center text-sm
    justify-center h-6.5  transition-all font-medium hover:font-bold duration-200
    ${px || "px-7"} ${white ? "text-gray-200" : "text-[#11061f]/80"} ${className || ""}`;

  const spanClasses = "relative z-10";
  return (
    <button className={classes} onClick={onClick} disabled={disabled}>
      <span className={spanClasses}>{children}</span>
      <ButtonSvg disabled={disabled} />
    </button>
  );
};

// [#553b6d]


export default Button;
