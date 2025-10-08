import Link from "next/link";
import Header from "@/app/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background flex items-center px-4">
        <div className="max-w-md mx-auto w-full text-center space-y-6">
          <div className="space-y-3">
            <p className="text-7xl font-bold tracking-tight text-foreground/10 select-none">
              404
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Página no encontrada
            </h1>
            <p className="text-sm text-foreground/70 leading-relaxed">
              No pudimos encontrar lo que buscás.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium border border-border bg-background hover:bg-muted text-foreground/80 hover:text-foreground transition"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
