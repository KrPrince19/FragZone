"use client";

import { useEffect, useState } from "react";

export default function Typing({
  text = "Compete. Win. Dominate.",
  speed = 80,
  className = "",
}) {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return (
    <h1
      className={`text-3xl md:text-4xl font-extrabold text-green-400 tracking-wide ${className}`}
    >
      {displayText}
      <span className="animate-pulse text-green-500">|</span>
    </h1>
  );
}
