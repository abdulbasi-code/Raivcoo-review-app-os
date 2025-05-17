"use client";
import React from "react";
import { motion } from "motion/react";

type SpotlightProps = {
  gradientFirst?: string;
  gradientSecond?: string;
  gradientThird?: string;
  translateY?: number;
  width?: number;
  height?: number;
  smallWidth?: number;
  duration?: number;
};

export const Spotlight = ({
  gradientFirst = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(250, 100%, 85%, .08) 0, hsla(250, 100%, 55%, .02) 50%, hsla(250, 100%, 45%, 0) 80%)",
  gradientSecond = "radial-gradient(50% 50% at 50% 50%, hsla(230, 100%, 85%, .06) 0, hsla(230, 100%, 55%, .02) 80%, transparent 100%)",
  gradientThird = "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .04) 0, hsla(210, 100%, 45%, .02) 80%, transparent 100%)",
  translateY = -350,
  width = 760,
  height = 2380,
  smallWidth = 240,
  duration = 7,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="absolute inset-0 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-screen z-20">
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(-45deg)`,
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className="absolute top-0 left-0"
        />

        <div
          style={{
            transform: "rotate(-45deg) translate(5%, -50%)",
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className="absolute top-0 left-0 origin-top-left"
        />

        <div
          style={{
            transform: "rotate(-45deg) translate(-180%, -70%)",
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className="absolute top-0 left-0 origin-top-left"
        />
      </div>

      <div className="absolute top-0 right-0 w-screen h-screen z-40 pointer-events-none">
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(45deg)`,
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className="absolute top-0 right-0"
        />

        <div
          style={{
            transform: "rotate(45deg) translate(-5%, -50%)",
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className="absolute top-0 right-0 origin-top-right"
        />

        <div
          style={{
            transform: "rotate(45deg) translate(180%, -70%)",
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className="absolute top-0 right-0 origin-top-right"
        />
      </div>
    </motion.div>
  );
};



export const GridBackground = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 z-0"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        backgroundSize: "32px 32px", // Grid size
        maskImage:
          "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 33%)", // Fade effect
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 50%)", // Safari support
      }}
    />
  );
};