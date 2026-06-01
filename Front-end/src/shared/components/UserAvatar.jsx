import React, { useState } from "react";

const getUserImageUrl = (user) => {
  if (!user?.photo_url) return null;
  if (/^https?:\/\//i.test(user.photo_url)) return user.photo_url;

  const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const imagePath = String(user.photo_url).replace(/^\//, "");
  return `${baseUrl}/storage/${imagePath}`;
};

const UserAvatar = ({
  user,
  className = "h-9 w-9 rounded-lg",
  fallbackClassName = "bg-white text-primary-800 font-black",
  imageClassName = "",
  alt,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = !imageFailed ? getUserImageUrl(user) : null;
  const name = user?.nom || user?.name || "Utilisateur";
  const fallback = name[0]?.toUpperCase() || "U";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${className} ${imageUrl ? "" : fallbackClassName}`}
      aria-label={alt || name}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt || name}
          className={`h-full w-full object-cover ${imageClassName}`}
          onError={() => setImageFailed(true)}
        />
      ) : (
        fallback
      )}
    </span>
  );
};

export default UserAvatar;
