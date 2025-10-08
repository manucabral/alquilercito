"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import type { PropertyListing } from "@/lib/types";

interface PropertiesListProps {
  initialListings: PropertyListing[];
}

// TODO: move to hooks or context
const ITEMS_PER_PAGE = 12;
const FAVORITES_KEY = "alquilercito:favorites";

export default function PropertiesList({
  initialListings,
}: PropertiesListProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [currencyFilter, setCurrencyFilter] = useState<"all" | "usd" | "pesos">(
    "all"
  );
  const [citySearch, setCitySearch] = useState("");
  const [roomsFilter, setRoomsFilter] = useState<
    "all" | "1" | "2" | "3" | "4+"
  >("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "ph" | "depto">("all");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = loaderRef.current; // capture ref value for cleanup
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting)
          setDisplayCount((p) => p + ITEMS_PER_PAGE);
      },
      { rootMargin: "120px" }
    );
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, []);

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [currencyFilter, citySearch, sortOrder, roomsFilter, typeFilter]);

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
  const filterByCity = (ls: PropertyListing[]) =>
    !citySearch.trim()
      ? ls
      : ls.filter(
          (l) =>
            l.city.toLowerCase().includes(citySearch.toLowerCase()) ||
            l.address.toLowerCase().includes(citySearch.toLowerCase())
        );
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

  const filteredListings = sortListings(
    filterByRooms(
      filterByType(
        filterByCity(filterByCurrency(filterByFavorites(initialListings)))
      )
    )
  );
  const displayedListings = filteredListings.slice(0, displayCount);
  const hasMore = displayCount < filteredListings.length;
  const hasFilters =
    currencyFilter !== "all" ||
    citySearch.trim() ||
    sortOrder !== "none" ||
    roomsFilter !== "all" ||
    typeFilter !== "all" ||
    showFavoritesOnly;

  const Icon = ({ name, className }: { name: string; className?: string }) => {
    const base = "w-3.5 h-3.5 stroke-current";
    switch (name) {
      case "ruler":
        return (
          <svg
            className={`${base} ${className || ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path d="M3 17.25V6.75A1.75 1.75 0 0 1 4.75 5h14.5A1.75 1.75 0 0 1 21 6.75v10.5A1.75 1.75 0 0 1 19.25 19H4.75A1.75 1.75 0 0 1 3 17.25Z" />
            <path d="M7 9h2M7 12h4M7 15h2M13 9h4" />
          </svg>
        );
      case "rooms":
        return (
          <svg
            className={`${base} ${className || ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path d="M4 20V4h16v16M9 20v-6h6v6M9 8h6" />
          </svg>
        );
      case "bath":
        return (
          <svg
            className={`${base} ${className || ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path d="M5 11v5a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-5H5Z" />
            <path d="M7 11V7a3 3 0 0 1 3-3h0c1.657 0 3 1.343 3 3v4m-8 0h14" />
          </svg>
        );
      case "ph":
        return (
          <svg
            className={`${base} ${className || ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path d="M3 21V9l9-6 9 6v12" />
            <path d="M9 21v-6h6v6" />
          </svg>
        );
      case "depto":
        return (
          <svg
            className={`${base} ${className || ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path d="M4 21V5l8-3 8 3v16" />
            <path d="M9 9h6M9 13h6M9 17h6" />
          </svg>
        );
      case "calendar":
        return (
          <svg
            className={`${base} ${className || ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path d="M7 4v3m10-3v3M5 8h14M6 12h2m4 0h2m4 0h-2M6 16h2m4 0h2m4 0h-2" />
            <rect x="3" y="4" width="18" height="16" rx="2" />
          </svg>
        );
      default:
        return null;
    }
  };

  interface PillProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }
  const Pill = ({ active, onClick, children }: PillProps) => (
    <button
      onClick={onClick}
      className={`h-7 px-3 rounded-full text-[11px] font-medium tracking-wide border transition-colors ${
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-background text-foreground/70 border-border hover:text-foreground"
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40`}
    >
      {children}
    </button>
  );
  interface TagProps {
    children: React.ReactNode;
    className?: string;
  }
  const Tag = ({ children, className = "" }: TagProps) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}
    >
      {children}
    </span>
  );

  const SourceBadge = ({ source }: { source: string }) => {
    const isZP = source === "zonaprop";
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md tracking-wide shadow-sm ${
          isZP ? "bg-violet-600/90 text-white" : "bg-orange-500/90 text-white"
        }`}
      >
        {isZP ? "ZonaProp" : "ArgenProp"}
      </span>
    );
  };

  const TypeBadge = ({ isPH }: { isPH: boolean }) => (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md ${
        isPH
          ? "bg-emerald-600/90 text-white"
          : "bg-neutral-800/80 text-white dark:bg-neutral-200 dark:text-neutral-900"
      }`}
    >
      {isPH ? "PH" : "Depto"}
    </span>
  );

  const Metric = ({
    icon,
    children,
  }: {
    icon: string;
    children: React.ReactNode;
  }) => (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 text-muted-foreground px-2 py-0.5 text-[10px] font-medium">
      <Icon name={icon} />
      {children}
    </span>
  );

  const Empty = () => (
    <div className="border border-dashed border-border rounded-lg p-10 text-center space-y-3">
      <p className="text-sm font-medium">Sin resultados</p>
      <p className="text-xs text-muted-foreground">
        {showFavoritesOnly
          ? "No tenés favoritos todavía. Marcá el ícono en una propiedad."
          : "Ajustá o limpiá los filtros para ver propiedades."}
      </p>
      <button
        onClick={() => {
          setCurrencyFilter("all");
          setCitySearch("");
          setSortOrder("none");
          setRoomsFilter("all");
          setTypeFilter("all");
          setShowFavoritesOnly(false);
        }}
        className="text-[11px] mt-2 px-3 h-7 rounded-md border border-border bg-background hover:bg-muted text-foreground/80 hover:text-foreground transition"
      >
        Limpiar
      </button>
    </div>
  );

  const cards = useMemo(() => displayedListings, [displayedListings]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
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
              setSortOrder("none");
              setRoomsFilter("all");
              setTypeFilter("all");
            }}
            className="self-start text-[11px] h-7 px-3 rounded-full border border-border bg-background hover:bg-muted text-foreground/70 hover:text-foreground transition"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 text-[11px]">
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
              ARS
            </Pill>
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="font-medium">Ambientes</p>
          <div className="flex gap-1.5 flex-wrap">
            <Pill
              active={roomsFilter === "all"}
              onClick={() => setRoomsFilter("all")}
            >
              Todos
            </Pill>
            <Pill
              active={roomsFilter === "1"}
              onClick={() => setRoomsFilter("1")}
            >
              1
            </Pill>
            <Pill
              active={roomsFilter === "2"}
              onClick={() => setRoomsFilter("2")}
            >
              2
            </Pill>
            <Pill
              active={roomsFilter === "3"}
              onClick={() => setRoomsFilter("3")}
            >
              3
            </Pill>
            <Pill
              active={roomsFilter === "4+"}
              onClick={() => setRoomsFilter("4+")}
            >
              4+
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
          <p className="font-medium">Localidad</p>
          <input
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full h-7 px-3 rounded-md border border-border bg-background text-foreground/80 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 text-[11px]"
          />
        </div>
        <div className="space-y-1.5">
          <p className="font-medium">Precio</p>
          <div className="flex gap-1.5 flex-wrap">
            <Pill
              active={sortOrder === "asc"}
              onClick={() => setSortOrder("asc")}
            >
              Menor
            </Pill>
            <Pill
              active={sortOrder === "desc"}
              onClick={() => setSortOrder("desc")}
            >
              Mayor
            </Pill>
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="font-medium">Favoritos</p>
          <div className="flex gap-1.5 flex-wrap">
            <Pill
              active={showFavoritesOnly}
              onClick={() => setShowFavoritesOnly((p) => !p)}
            >
              {showFavoritesOnly ? "Sólo favoritos" : "Ver favoritos"}
            </Pill>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.length === 0 && <Empty />}
        {cards.map((l, i) => {
          const hasImg = !!l.mainImage;
          const fav = isFav(l.url);
          return (
            <div
              key={i}
              className="relative border border-border rounded-lg overflow-hidden bg-card/70 backdrop-blur-sm hover:bg-card transition-colors focus-within:ring-2 focus-within:ring-ring/40"
            >
              <button
                onClick={() => toggleFavorite(l.url)}
                aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
                className={`absolute top-2 right-2 z-10 h-7 w-7 inline-flex items-center justify-center rounded-full backdrop-blur-md border text-[13px] transition ${
                  fav
                    ? "bg-emerald-600/90 text-white border-emerald-500 hover:bg-emerald-600"
                    : "bg-background/70 border-border hover:bg-muted text-foreground/70 hover:text-foreground"
                }`}
              >
                {fav ? "★" : "☆"}
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
                    <Image
                      src={l.mainImage || "/placeholder.svg"}
                      alt={l.city}
                      fill
                      sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[11px]">
                      Sin imagen
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    <TypeBadge isPH={l.isPH} />
                    <SourceBadge source={l.source} />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
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
                    <p className="text-[13px] font-medium text-foreground line-clamp-1">
                      {l.address || l.city}
                    </p>
                    <div className="flex flex-wrap gap-2 items-center">
                      {l.city && l.address && (
                        <span className="text-[10px] text-muted-foreground">
                          {l.city}
                        </span>
                      )}
                      {l.publishedDate && (
                        <Tag className="bg-muted/60 text-muted-foreground">
                          <Icon name="calendar" />
                          {l.publishedDate}
                        </Tag>
                      )}
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
        })}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="flex flex-col items-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-transparent" />
          <p className="text-[11px] text-muted-foreground mt-3">Cargando...</p>
        </div>
      )}
      {!hasMore && filteredListings.length > ITEMS_PER_PAGE && (
        <p className="text-center text-[11px] text-muted-foreground py-10 border-t border-border/40">
          {filteredListings.length} propiedades
        </p>
      )}
    </div>
  );
}
