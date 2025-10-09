/* eslint-disable @next/next/no-img-element */
"use client";

export default function Lightbox({
  open,
  images,
  index,
  setIndex,
  onClose,
  onPrev,
  onNext,
}: {
  open: boolean;
  images: string[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!open || images.length === 0) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute z-20 top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 flex items-center justify-center"
      >
        ✕
      </button>
      {images.length > 1 && (
        <>
          <button
            aria-label="Anterior"
            onClick={onPrev}
            className="absolute z-20 left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 flex items-center justify-center"
          >
            ‹
          </button>
          <button
            aria-label="Siguiente"
            onClick={onNext}
            className="absolute z-20 right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 flex items-center justify-center"
          >
            ›
          </button>
        </>
      )}
      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        onClick={onClose}
        aria-label="Cerrar al hacer click en el fondo"
      >
        <div
          className="relative w-full h-full max-w-6xl max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((src, i) => (
            <img
              key={src + i}
              src={src || "/placeholder.svg"}
              alt="Imagen de propiedad"
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <div className="absolute z-20 bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir a la imagen ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
