/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { PropertyListing } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useLightbox } from "./properties/useLightbox";
import Lightbox from "./properties/Lightbox";
import { Pill, EmptyState } from "./properties/Primitives";
import PropertyCard from "./properties/PropertyCard";
import HighlightedCard from "./properties/HighlightedCard";

interface PropertiesListProps {
  initialListings: PropertyListing[];
  highlightTarget?: string;
}

const ITEMS_PER_PAGE = 12;
const FAVORITES_KEY = "alquilercito:favorites";

export default function PropertiesList({
  initialListings,
  highlightTarget,
}: PropertiesListProps) {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [currencyFilter, setCurrencyFilter] = useState<"all" | "usd" | "pesos">(
    "all"
  );
  type CityPreset =
    | "all"
    | "palermo"
    | "coghlan"
    | "belgrano"
    | "saavedra"
    | "villa urquiza"
    | "vicente lopez";
  const [selectedBarrios, setSelectedBarrios] = useState<CityPreset[]>(["all"]);
  const [citySearch, setCitySearch] = useState("");
  const [roomsFilter, setRoomsFilter] = useState<
    "all" | "1" | "2" | "3" | "4+"
  >("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "ph" | "depto">("all");
  const [updatedFilter, setUpdatedFilter] = useState<"all" | "today">("all");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [isPaging, setIsPaging] = useState(false);
  const isPagingRef = useRef(false);
  const hasMoreRef = useRef(false);
  const {
    open: lightboxOpen,
    images: lightboxImages,
    index: lightboxIndex,
    setIndex: setLightboxIndex,
    openLightbox,
    closeLightbox,
    next: nextLightbox,
    prev: prevLightbox,
  } = useLightbox();

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [
    currencyFilter,
    citySearch,
    selectedBarrios,
    sortOrder,
    roomsFilter,
    typeFilter,
    updatedFilter,
    showFavoritesOnly,
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        setFavorites(new Set(arr));
      }
    } catch (e) {
      console.warn("Failed to parse favorites", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
  }, [favorites, hydrated]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const isFav = (id: string) => favorites.has(id);
  const parsePrice = (p: string) =>
    Number.parseInt(p.replace(/[USD$.,\s]/gi, ""), 10) || 0;
  const filterByCurrency = (ls: PropertyListing[]) =>
    currencyFilter === "all"
      ? ls
      : ls.filter((l) => (currencyFilter === "usd" ? l.isDollar : !l.isDollar));
  const filterByCity = (ls: PropertyListing[]) => {
    let out = ls;
    if (!(selectedBarrios.length === 1 && selectedBarrios[0] === "all")) {
      const keys = selectedBarrios.map((k) => k.toLowerCase());
      out = out.filter((l) => {
        const fields = [l.city, l.address].map((v) => v.toLowerCase());
        return keys.some((k) => fields.some((f) => f.includes(k)));
      });
    }
    if (citySearch.trim()) {
      const q = citySearch.toLowerCase();
      out = out.filter(
        (l) =>
          l.city.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q)
      );
    }
    return out;
  };
  const filterByRooms = (ls: PropertyListing[]) =>
    roomsFilter === "all"
      ? ls
      : ls.filter((l) => {
          if (!l.rooms) return false;
          const r = parseInt(l.rooms, 10);
          return roomsFilter === "4+"
            ? r >= 4
            : r === parseInt(roomsFilter, 10);
        });
  const filterByType = (ls: PropertyListing[]) =>
    typeFilter === "all"
      ? ls
      : ls.filter((l) => (typeFilter === "ph" ? l.isPH : !l.isPH));
  const sortListings = (ls: PropertyListing[]) =>
    sortOrder === "none"
      ? ls
      : [...ls].sort(
          (a, b) =>
            (parsePrice(a.price) - parsePrice(b.price)) *
            (sortOrder === "asc" ? 1 : -1)
        );
  const filterByFavorites = (ls: PropertyListing[]) => {
    if (!showFavoritesOnly) return ls;
    return ls.filter((l) => isFav(l.url));
  };

  const formatRelativeDate = useCallback((iso: string) => {
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(iso)) return null;
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return null;
    const startOfDate = new Date(y, m - 1, d);
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const diffMs = startOfToday.getTime() - startOfDate.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays <= 0) return "Actualizado hoy";
    if (diffDays === 1) return "Actualizado hace 1 día";
    if (diffDays >= 365) {
      const years = Math.floor(diffDays / 365);
      if (years === 1) return "Actualizado hace 1 año";
      return `Actualizado hace ${years} años`;
    }
    if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      if (months === 1) return "Actualizado hace 1 mes";
      return `Actualizado hace ${months} meses`;
    }
    return `Actualizado hace ${diffDays} días`;
  }, []);

  const filterByUpdated = (ls: PropertyListing[]) => {
    if (updatedFilter === "all") return ls;
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    return ls.filter((l) => {
      if (!l.publishedDate) return false;
      if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(l.publishedDate)) return false;
      const [py, pm, pd] = l.publishedDate.split("-").map(Number);
      if (!py || !pm || !pd) return false;
      return py === y && pm - 1 === m && pd === d;
    });
  };

  const [clearedHighlight, setClearedHighlight] = useState(false);
  const highlighted = useMemo(() => {
    if (clearedHighlight) return undefined;
    return highlightTarget
      ? initialListings.find((l) => l.url === highlightTarget)
      : undefined;
  }, [highlightTarget, initialListings, clearedHighlight]);

  const getSiteOrigin = () => {
    if (typeof window !== "undefined") {
      return (
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        window.location.origin.replace(/\/$/, "")
      );
    }
    return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
  };

  const buildShareUrl = (propertyUrl: string) => {
    const base = getSiteOrigin();
    return `${base}?target=${encodeURIComponent(propertyUrl)}`;
  };

  const handleShare = async (propertyUrl: string) => {
    const shareUrl = buildShareUrl(propertyUrl);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(propertyUrl);
      setTimeout(() => {
        setCopiedId((prev) => (prev === propertyUrl ? null : prev));
      }, 2000);
    } catch (err) {
      console.warn("Copy failed", err);
    }
  };

  const filteredListings = sortListings(
    filterByRooms(
      filterByType(
        filterByCity(
          filterByCurrency(filterByUpdated(filterByFavorites(initialListings)))
        )
      )
    )
  );
  useEffect(() => {
    if (displayCount > filteredListings.length) {
      setDisplayCount((prev) => Math.min(filteredListings.length, prev));
    }
  }, [filteredListings.length, displayCount]);

  useEffect(() => {
    const currentHasMore = displayCount < filteredListings.length;
    hasMoreRef.current = currentHasMore;
    if (!currentHasMore) {
      isPagingRef.current = false;
      if (isPaging) setIsPaging(false);
    } else {
      if (isPagingRef.current) {
        isPagingRef.current = false;
        if (isPaging) setIsPaging(false);
      }
    }
  }, [displayCount, filteredListings.length, isPaging]);
  const filteredMinusHighlight = highlighted
    ? filteredListings.filter((l) => l !== highlighted)
    : filteredListings;
  const displayedListings = filteredMinusHighlight.slice(0, displayCount);
  const hasMore = displayCount < filteredListings.length;
  const hasFilters =
    currencyFilter !== "all" ||
    citySearch.trim() ||
    !(selectedBarrios.length === 1 && selectedBarrios[0] === "all") ||
    sortOrder !== "none" ||
    roomsFilter !== "all" ||
    typeFilter !== "all" ||
    updatedFilter !== "all" ||
    showFavoritesOnly;

  const cards = useMemo(() => displayedListings, [displayedListings]);

  useEffect(() => {
    const target = loaderRef.current;
    if (!target || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first || !first.isIntersecting) return;
        if (!hasMoreRef.current || isPagingRef.current) return;
        isPagingRef.current = true;
        setIsPaging(true);
        setDisplayCount((p) => p + ITEMS_PER_PAGE);
      },
      { rootMargin: "160px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {highlighted && (
        <HighlightedCard
          listing={highlighted}
          onOpenLightbox={(imgs) => openLightbox(imgs, 0)}
          onRemove={() => {
            setClearedHighlight(true);
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.delete("target");
              router.replace(url.pathname + url.search + url.hash);
            }
          }}
          onShare={() => handleShare(highlighted.url)}
        />
      )}
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
          Propiedades{" "}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {filteredListings.length}/{initialListings.length}
          </span>
        </h2>
        {hasFilters && (
          <button
            onClick={() => {
              setCurrencyFilter("all");
              setCitySearch("");
              setSelectedBarrios(["all"]);
              setSortOrder("none");
              setRoomsFilter("all");
              setTypeFilter("all");
              setUpdatedFilter("all");
              setShowFavoritesOnly(false);
            }}
            className="self-start text-[11px] h-7 px-3 rounded-full border border-border bg-background hover:bg-muted text-foreground/70 hover:text-foreground transition"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6 text-[11px]">
        <div className="space-y-1.5">
          <p className="font-medium">Barrios</p>
          <div className="flex gap-1.5 flex-wrap">
            {(
              [
                { key: "all", label: "Todos" },
                { key: "palermo", label: "Palermo" },
                { key: "coghlan", label: "Coghlan" },
                { key: "belgrano", label: "Belgrano" },
                { key: "saavedra", label: "Saavedra" },
                { key: "villa urquiza", label: "Villa Urquiza" },
                { key: "vicente lopez", label: "Vicente López" },
              ] as const
            ).map((b) => (
              <Pill
                key={b.key}
                active={
                  b.key === "all"
                    ? selectedBarrios.length === 1 &&
                      selectedBarrios[0] === "all"
                    : selectedBarrios.includes(b.key)
                }
                onClick={() => {
                  if (b.key === "all") {
                    setSelectedBarrios(["all"]);
                    return;
                  }
                  setSelectedBarrios((prev) => {
                    const base =
                      prev[0] === "all" && prev.length === 1 ? [] : [...prev];
                    const idx = base.indexOf(b.key as CityPreset);
                    if (idx >= 0) {
                      base.splice(idx, 1);
                      return base.length === 0 ? ["all"] : base;
                    } else {
                      base.push(b.key as CityPreset);
                      return base;
                    }
                  });
                }}
              >
                {b.label}
              </Pill>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="font-medium">Buscar</p>
          <input
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Barrio o calle"
            className="w-full h-8 rounded-md border border-border bg-background px-2 text-[11px]"
          />
          <div className="flex gap-1.5 flex-wrap">
            <Pill
              active={showFavoritesOnly}
              onClick={() => setShowFavoritesOnly((v) => !v)}
            >
              Solo favoritos
            </Pill>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="font-medium">Moneda</p>
          <div className="flex gap-1.5 flex-wrap">
            <Pill
              active={currencyFilter === "all"}
              onClick={() => setCurrencyFilter("all")}
            >
              Todas
            </Pill>
            <Pill
              active={currencyFilter === "usd"}
              onClick={() => setCurrencyFilter("usd")}
            >
              USD
            </Pill>
            <Pill
              active={currencyFilter === "pesos"}
              onClick={() => setCurrencyFilter("pesos")}
            >
              Pesos
            </Pill>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="font-medium">Tipo</p>
          <div className="flex gap-1.5 flex-wrap">
            <Pill
              active={typeFilter === "all"}
              onClick={() => setTypeFilter("all")}
            >
              Todos
            </Pill>
            <Pill
              active={typeFilter === "ph"}
              onClick={() => setTypeFilter("ph")}
            >
              PH
            </Pill>
            <Pill
              active={typeFilter === "depto"}
              onClick={() => setTypeFilter("depto")}
            >
              Depto
            </Pill>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="font-medium">Ambientes</p>
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "1", "2", "3", "4+"] as const).map((r) => (
              <Pill
                key={r}
                active={roomsFilter === r}
                onClick={() => setRoomsFilter(r)}
              >
                {r === "all" ? "Todos" : r}
              </Pill>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="font-medium">Actualizado</p>
          <div className="flex gap-1.5 flex-wrap">
            <Pill
              active={updatedFilter === "all"}
              onClick={() => setUpdatedFilter("all")}
            >
              Todos
            </Pill>
            <Pill
              active={updatedFilter === "today"}
              onClick={() => setUpdatedFilter("today")}
            >
              Hoy
            </Pill>
          </div>
          <p className="font-medium mt-2">Precio</p>
          <div className="flex gap-1.5 flex-wrap">
            <Pill
              active={sortOrder === "none"}
              onClick={() => setSortOrder("none")}
            >
              Sin orden
            </Pill>
            <Pill
              active={sortOrder === "asc"}
              onClick={() => setSortOrder("asc")}
            >
              Más bajo
            </Pill>
            <Pill
              active={sortOrder === "desc"}
              onClick={() => setSortOrder("desc")}
            >
              Más alto
            </Pill>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.length === 0 && (
          <EmptyState
            onClear={() => {
              setCurrencyFilter("all");
              setCitySearch("");
              setSelectedBarrios(["all"]);
              setSortOrder("none");
              setRoomsFilter("all");
              setTypeFilter("all");
              setUpdatedFilter("all");
              setShowFavoritesOnly(false);
            }}
          />
        )}
        {cards.map((l, i) => {
          const fav = isFav(l.url);
          const publishedText = l.publishedDate
            ? formatRelativeDate(l.publishedDate)
            : null;
          return (
            <PropertyCard
              key={i}
              listing={l}
              isFav={fav}
              onToggleFav={() => toggleFavorite(l.url)}
              onShare={() => handleShare(l.url)}
              onOpenLightbox={(imgs) => openLightbox(imgs, 0)}
              publishedText={publishedText}
            />
          );
        })}
      </div>

      <Lightbox
        open={lightboxOpen}
        images={lightboxImages}
        index={lightboxIndex}
        setIndex={setLightboxIndex}
        onClose={closeLightbox}
        onPrev={prevLightbox}
        onNext={nextLightbox}
      />

      {hasMore && (
        <div
          ref={loaderRef}
          className="flex flex-col items-center py-10 min-h-[48px]"
        >
          {isPaging && (
            <>
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-transparent" />
              <p className="text-[11px] text-muted-foreground mt-3">
                Cargando...
              </p>
            </>
          )}
        </div>
      )}
      {!hasMore && filteredListings.length > 0 && (
        <div className="text-center text-[11px] text-muted-foreground py-10 border-t border-border/40 space-y-2">
          <p>No hay más resultados</p>
          <p className="text-muted-foreground/70">
            {filteredListings.length} propiedades
          </p>
        </div>
      )}
    </div>
  );
}
