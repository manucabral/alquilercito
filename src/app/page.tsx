import { fetchAllProperties } from "@/lib/csv-fetcher";
import Header from "@/app/components/Header";
import PropertiesList from "./components/PropertiesList";
import type { PropertyListing } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Alquilercito — Alquileres actualizados diariamente",
  description:
    "Compará alquileres de ZonaProp y ArgenProp. Actualizados cada día a las 16:00 hs. Cobertura inicial: Coghlan, Belgrano, Saavedra, Villa Urquiza y Vicente López. Filtrá por moneda, ambientes y localidad.",
};

type SearchParams = { [key: string]: string | string[] | undefined };

interface PageProps {
  searchParams?: SearchParams | Promise<SearchParams>;
}

export default async function Page({ searchParams }: PageProps) {
  let listings: PropertyListing[] = [];
  let error: string | null = null;

  try {
    listings = await fetchAllProperties();
  } catch (err) {
    error = err instanceof Error ? err.message : "Error desconocido";
    console.error("Error fetching properties:", err);
  }

  let resolvedSearchParams: SearchParams = {};
  if (searchParams) {
    if (typeof (searchParams as any).then === "function") {
      try {
        resolvedSearchParams = await (searchParams as Promise<SearchParams>);
      } catch {
        // Ignore search params resolution errors; leave empty object
        resolvedSearchParams = {};
      }
    } else {
      resolvedSearchParams = searchParams as SearchParams;
    }
  }

  const rawTarget = resolvedSearchParams.target;
  const highlightTarget =
    typeof rawTarget === "string"
      ? rawTarget
      : Array.isArray(rawTarget)
      ? rawTarget[0]
      : undefined;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <p className="text-sm text-foreground/80 dark:text-foreground/70 leading-relaxed max-w-2xl space-y-1">
            <span>
              Alquileres actualizados{" "}
              <span className="font-medium"> diariamente a las 16:00 hs</span>.
              Filtrá por moneda, ambientes y localidad.
            </span>
            <br />
            <span className="text-foreground/60 text-[13px]">
              Cobertura actual: Coghlan · Belgrano · Saavedra · Villa Urquiza ·
              Vicente López
            </span>
          </p>
          {error && (
            <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <svg
                className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-destructive">Error</p>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {!error && listings.length > 0 && (
            <PropertiesList
              initialListings={listings}
              highlightTarget={highlightTarget}
            />
          )}

          {!error && listings.length === 0 && (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <p className="text-muted-foreground">
                No se encontraron propiedades.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
