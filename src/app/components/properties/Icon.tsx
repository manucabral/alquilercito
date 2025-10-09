export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
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
}
