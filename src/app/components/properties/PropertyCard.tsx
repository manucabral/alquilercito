/* eslint-disable @next/next/no-img-element */
"use client";
import type { PropertyListing } from "@/lib/types";
import CardImageCarousel from "./CardImageCarousel";
import { Metric, SourceBadge, TypeBadge, Tag } from "./Primitives";
import { Icon } from "./Icon";

export default function PropertyCard({
  listing,
  isFav,
  onToggleFav,
  onShare,
  onOpenLightbox,
  publishedText,
}: {
  listing: PropertyListing;
  isFav: boolean;
  onToggleFav: () => void;
  onShare: () => void;
  onOpenLightbox: (images: string[], start?: number) => void;
  publishedText?: string | null;
}) {
  const l = listing;
  const allImages =
    l.images && l.images.length ? l.images : l.mainImage ? [l.mainImage] : [];
  const hasImg = allImages.length > 0;
  return (
    <div className="relative border border-border rounded-lg overflow-hidden bg-card/70 backdrop-blur-sm hover:bg-card transition-colors focus-within:ring-2 focus-within:ring-ring/40">
      <button
        onClick={onToggleFav}
        aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
        className={`absolute top-2 right-2 z-10 h-7 w-7 inline-flex items-center justify-center rounded-full backdrop-blur-md border text-[13px] transition ${
          isFav
            ? "bg-emerald-600/90 text-white border-emerald-500 hover:bg-emerald-600"
            : "bg-background/70 border-border hover:bg-muted text-foreground/70 hover:text-foreground"
        }`}
      >
        {isFav ? "★" : "☆"}
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onShare();
        }}
        aria-label="Copiar enlace"
        title="Copiar enlace"
        className={`absolute top-2 right-11 z-10 h-7 px-2 inline-flex items-center justify-center rounded-full backdrop-blur-md border text-[11px] font-medium tracking-wide transition bg-black/40 text-white border-white/20 hover:bg-black/55`}
      >
        🔗
      </button>
      <a
        href={l.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block focus:outline-none"
      >
        <div
          className={`relative ${
            hasImg ? "aspect-[4/3]" : "h-32"
          } w-full bg-muted overflow-hidden`}
        >
          {hasImg ? (
            allImages.length > 1 ? (
              <CardImageCarousel
                images={allImages}
                alt={l.city}
                onOpen={() => onOpenLightbox(allImages, 0)}
              />
            ) : (
              <img
                src={allImages[0] || "/placeholder.svg"}
                alt={l.city}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenLightbox(allImages, 0);
                }}
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[11px]">
              Sin imagen
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            <TypeBadge isPH={l.isPH} />
            <SourceBadge source={l.source} />
          </div>
          {allImages.length > 1 && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/55 text-white text-[10px] font-medium">
              {allImages.length} fotos
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400">
                {l.price}
              </span>
              {l.expenses && (
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  + {l.expenses}
                </span>
              )}
            </p>
            <p className="text-[13px] font-medium text-foreground line-clamp-1">
              {l.address || l.city}
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              {l.city && l.address && (
                <span className="text-[10px] text-muted-foreground">
                  {l.city}
                </span>
              )}
              <Tag className="bg-muted/60 text-muted-foreground">
                <Icon name="calendar" />
                {publishedText || "Sin fecha"}
              </Tag>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {l.totalM2 && <Metric icon="ruler">{l.totalM2}</Metric>}
            {l.rooms && <Metric icon="rooms">{l.rooms}</Metric>}
            {l.bathrooms && <Metric icon="bath">{l.bathrooms}</Metric>}
          </div>
          {l.description && (
            <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
              {l.description}
            </p>
          )}
        </div>
      </a>
    </div>
  );
}
