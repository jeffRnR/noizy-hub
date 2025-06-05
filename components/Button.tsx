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
    justify-center h-6.5 transition-all hover:text-[#553b6d]/80 font-medium hover:font-bold duration-200
    ${px || "px-7"} text-[#11061f]/80 ${className || ""}`;

  const spanClasses = "relative z-10";

  return (
    <button className={classes} onClick={onClick} disabled={disabled}>
      <span className={spanClasses}>{children}</span>
      <ButtonSvg white={white} disabled={disabled} />
    </button>
  );
};


export default Button;
