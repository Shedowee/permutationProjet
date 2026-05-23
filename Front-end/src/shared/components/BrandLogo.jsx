import React from "react";
import { Link } from "react-router-dom";

const BrandLogo = ({
  className = "",
  alt = "Permutation logo",
  clickable = true,
  to = "/",
  linkClassName = "",
  ...props
}) => {
  const image = (
    <img
      src="/brand-logo.png"
      alt={alt}
      draggable="false"
      className={`block select-none object-contain ${className}`}
      {...props}
    />
  );

  if (!clickable) {
    return image;
  }

  return (
    <Link
      to={to}
      aria-label="Accueil OFPPT permutation"
      className={`inline-flex w-fit items-center transition-standard hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/15 ${linkClassName}`}
    >
      {image}
    </Link>
  );
};

export default BrandLogo;
