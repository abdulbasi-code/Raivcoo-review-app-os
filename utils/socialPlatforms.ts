// utils/socialPlatforms.ts

export const socialPlatforms = [
  {
    name: "YouTube",
    iconUrl: "/social/youtube_social_icon_red.avif",
    urlPattern: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i,
  },
  {
    name: "Instagram",
    iconUrl: "/social/Instagram_Glyph_Gradient.avif",
    urlPattern: /^(https?:\/\/)?(www\.)?instagram\.com\/.+$/i,
  },
  {
    name: "Twitter/X",
    iconUrl: "/social/logo-black.avif",
    urlPattern: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+$/i,
  },
  {
    name: "TikTok",
    iconUrl: "/social/TikTok_Icon_Black_Circle.avif",
    urlPattern: /^(https?:\/\/)?(www\.)?tiktok\.com\/@[a-zA-Z0-9._-]+$/i,
  },
];
