import { useEffect, useState } from "react";

export function useLightbox() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  const openLightbox = (imgs: string[], startIndex = 0) => {
    if (!imgs || imgs.length === 0) return;
    setImages(imgs);
    setIndex(Math.min(Math.max(startIndex, 0), imgs.length - 1));
    setOpen(true);
  };

  const closeLightbox = () => setOpen(false);
  const next = () => setIndex((i) => (i + 1) % Math.max(1, images.length));
  const prev = () =>
    setIndex(
      (i) => (i - 1 + Math.max(1, images.length)) % Math.max(1, images.length)
    );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    if (open) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [open]);

  return {
    open,
    images,
    index,
    setIndex,
    openLightbox,
    closeLightbox,
    next,
    prev,
  };
}
