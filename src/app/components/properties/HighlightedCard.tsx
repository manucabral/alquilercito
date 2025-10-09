/* eslint-disable @next/next/no-img-element */
"use client";
import type { PropertyListing } from "@/lib/types";
import CardImageCarousel from "./CardImageCarousel";
import { Metric, SourceBadge } from "./Primitives";

export default function HighlightedCard({
  listing,
  onOpenLightbox,
  onRemove,
  onShare,
}: {
  listing: PropertyListing;
  onOpenLightbox: (images: string[], start?: number) => void;
  onRemove: () => void;
  onShare: () => void;
}) {
  const l = listing;
  return (
    <div className="border border-emerald-500/50 rounded-lg p-3 bg-emerald-500/5 relative">
      <div className="flex items-start gap-3">
        <div className="relative w-40 h-28 sm:w-48 sm:h-32 rounded-md overflow-hidden bg-muted flex-shrink-0">
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block w-full h-full"
          >
            {l.images && l.images.length > 1 ? (
              <CardImageCarousel
                images={l.images}
                alt={l.city}
                onOpen={() => onOpenLightbox(l.images!, 0)}
              />
            ) : l.images && l.images.length === 1 ? (
              <img
                src={l.images[0] || "/placeholder.svg"}
                alt={l.city}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenLightbox(l.images!, 0);
                }}
              />
            ) : l.mainImage ? (
              <img
                src={l.mainImage || "/placeholder.svg"}
                alt={l.city}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenLightbox([l.mainImage], 0);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">
                Sin imagen
              </div>
            )}
            <div className="absolute top-1 left-1">
              <SourceBadge source={l.source} />
            </div>
            {l.images && l.images.length > 1 && (
              <div className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-black/55 text-white text-[10px] font-medium">
                {l.images.length} fotos
              </div>
            )}
          </a>
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Alguien te compartió esta propiedad
          </p>
          <p className="text-sm font-semibold flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400">
              {l.price}
            </span>
            {l.expenses && (
              <span className="text-[10px] text-amber-600 dark:text-amber-300">
                + {l.expenses}
              </span>
            )}
          </p>
          <p className="text-[12px] font-medium text-foreground line-clamp-1">
            {l.address || l.city}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {l.totalM2 && <Metric icon="ruler">{l.totalM2}</Metric>}
            {l.rooms && <Metric icon="rooms">{l.rooms}</Metric>}
            {l.bathrooms && <Metric icon="bath">{l.bathrooms}</Metric>}
          </div>
          {l.description && (
            <p className="text-[10px] leading-relaxed text-muted-foreground line-clamp-2">
              {l.description}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1 items-end ml-2">
          <button
            type="button"
            onClick={onRemove}
            className="text-[10px] px-2 h-6 rounded-md border border-emerald-600/40 hover:bg-emerald-600/10 transition"
          >
            Quitar
          </button>
          <button
            type="button"
            onClick={onShare}
            className="text-[10px] px-2 h-6 rounded-md border border-emerald-600/40 hover:bg-emerald-600/10 transition"
          >
            Copiar
          </button>
        </div>
      </div>
    </div>
  );
}
