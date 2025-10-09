import { Icon } from "./Icon";

export function Tag({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function Metric({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 text-muted-foreground px-2 py-0.5 text-[10px] font-medium">
      <Icon name={icon} />
      {children}
    </span>
  );
}

export function SourceBadge({ source }: { source: string }) {
  const isZP = source === "zonaprop";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md tracking-wide shadow-sm ${
        isZP ? "bg-orange-500/90 text-white" : "bg-emerald-600/90 text-white"
      }`}
    >
      {isZP ? "ZonaProp" : "ArgenProp"}
    </span>
  );
}

export function TypeBadge({ isPH }: { isPH: boolean }) {
  return (
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
}

export function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
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
}

export function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="border border-dashed border-border rounded-lg p-10 text-center space-y-3">
      <p className="text-sm font-medium">Sin resultados</p>
      <p className="text-xs text-muted-foreground">
        Ajustá o limpiá los filtros para ver propiedades.
      </p>
      <button
        onClick={onClear}
        className="text-[11px] mt-2 px-3 h-7 rounded-md border border-border bg-background hover:bg-muted text-foreground/80 hover:text-foreground transition"
      >
        Limpiar
      </button>
    </div>
  );
}
