import React from "react";

const BrandLogo = ({ className = "", alt = "Permutation logo", ...props }) => {
  return (
    <img
      src="/brand-logo.png"
      alt={alt}
      draggable="false"
      className={`block select-none object-contain ${className}`}
      {...props}
    />
  );
};

export default BrandLogo;
