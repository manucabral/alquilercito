/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";

export default function CardImageCarousel({
  images,
  alt,
  onOpen,
}: {
  images: string[];
  alt: string;
  onOpen: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const total = images.length;
  return (
    <div className="relative w-full h-full">
      {images.map((src, i) => (
        <img
          key={i}
          src={src || "/placeholder.svg"}
          alt={alt}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {total > 1 && (
        <>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIdx(i);
                }}
                aria-label={`Ver imagen ${i + 1}`}
                className={`h-1.5 w-1.5 rounded-full transition ${
                  i === idx ? "bg-white" : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
          <div className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-white font-medium tracking-wide">
            {idx + 1}/{total}
          </div>
        </>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpen();
        }}
        aria-label="Ver en pantalla completa"
        className="absolute inset-0 z-[1]"
      />
    </div>
  );
}
