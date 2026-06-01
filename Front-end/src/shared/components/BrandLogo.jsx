import React from "react";
import { Link } from "react-router-dom";

export const BrandMark = ({ className = "" }) => (
  <span
    aria-hidden="true"
    className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-white text-primary-500 ring-1 ring-inset ring-primary-100 shadow-[0_16px_30px_-18px_rgba(0,146,69,0.6)] ${className}`}
  >
    <span className="font-black leading-none">P</span>
  </span>
);

const BrandLogo = ({
  className = "",
  alt = "MaPermutation",
  clickable = true,
  to = "/",
  linkClassName = "",
  showMark = true,
  markClassName = "h-9 w-9 text-xl",
  onClick,
  ...props
}) => {
  const brand = (
    <>
      {showMark && <BrandMark className={markClassName} />}
      <img
        src="/brand-wordmark.png"
        alt={alt}
        draggable="false"
        className={`block select-none object-contain ${className}`}
        {...props}
      />
    </>
  );

  if (!clickable) {
    return (
      <span onClick={onClick} className={`inline-flex w-fit items-center gap-3 ${linkClassName}`}>
        {brand}
      </span>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      aria-label="Accueil MaPermutation"
      className={`inline-flex w-fit items-center gap-3 transition-standard hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/15 ${linkClassName}`}
    >
      {brand}
    </Link>
  );
};

export default BrandLogo;
