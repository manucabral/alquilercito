import type { PropertyListing, PropertySource } from "./types";
let propertiesCache: { data: PropertyListing[]; expiresAt: number } | null =
  null;

function nextDailyCutoff(hour = 16, minute = 0): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  return target.getTime();
}

async function fetchCSVFromGitHub(filename: string): Promise<string> {
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
  const REPO_NAME = process.env.REPO_NAME;
  const BRANCH = process.env.BRANCH;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const url = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/${BRANCH}/data/${filename}`;
  const headers: HeadersInit = {
    Accept: "text/csv",
  };
  if (GITHUB_TOKEN) headers["Authorization"] = `token ${GITHUB_TOKEN}`;
  const response = await fetch(url, {
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${filename}: ${response.status} ${response.statusText}`
    );
  }
  return response.text();
}

function formatPrice(precio: string, esDolares: string): string {
  if (
    !precio ||
    precio === "" ||
    precio.toLowerCase().includes("consultar") ||
    precio === "0"
  )
    return "Consultar";
  const isDollar =
    esDolares.toLowerCase().trim() === "true" || esDolares.trim() === "1";
  const priceNum = parseInt(precio.replace(/\D/g, ""));
  if (isNaN(priceNum)) return "Consultar";
  if (isDollar) return `USD ${priceNum.toLocaleString("es-AR")}`;
  return `$ ${priceNum.toLocaleString("es-AR")}`;
}

function parseCSV(
  csvContent: string,
  sourceOverride?: PropertySource
): PropertyListing[] {
  const raw = csvContent.trim();
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = lines[0].split(",").map((h) =>
    h
      .replace(/(^\"|\"$)/g, "")
      .trim()
      .toLowerCase()
  );
  const colIndex = (name: string) => header.indexOf(name);

  const idx = {
    ubicacion: colIndex("ubicacion"),
    precio: colIndex("precio"),
    esDolares: colIndex("esdolares"),
    expensas: colIndex("expensas"),
    direccion: colIndex("direccion"),
    descripcion: colIndex("descripcion"),
    fechaPublicacion: colIndex("fechapublicacion"),
    url: colIndex("url"),
    imagen: colIndex("imagen"),
    metros: colIndex("metros"),
    ambientes: colIndex("ambientes"),
    banos: colIndex("banos"),
    source: colIndex("source"),
    esPH: colIndex("esph"),
  } as const;

  const listings: PropertyListing[] = [];

  for (let li = 1; li < lines.length; li++) {
    const line = lines[li];
    if (!line.trim()) continue;
    const fields: string[] = [];
    let currentField = "";
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') insideQuotes = !insideQuotes;
      else if (char === "," && !insideQuotes) {
        fields.push(currentField.trim());
        currentField = "";
      } else currentField += char;
    }
    fields.push(currentField.trim());

    const get = (index: number) =>
      index >= 0 && index < fields.length ? fields[index] : "";

    const ubicacion = get(idx.ubicacion);
    const precio = get(idx.precio);
    const esDolares = get(idx.esDolares);
    const expensas = get(idx.expensas);
    const direccion = get(idx.direccion);
    const descripcion = get(idx.descripcion);
    const fechaPublicacion = get(idx.fechaPublicacion);
    const url = get(idx.url);
    const imagen = get(idx.imagen);
    const metros = get(idx.metros);
    const ambientes = get(idx.ambientes);
    const banos = get(idx.banos);
    const source = get(idx.source);
    const esPHRaw = get(idx.esPH);

    let expensasFormatted: string | null = null;
    if (expensas) {
      const expensasNum = parseInt(expensas.replace(/\D/g, ""));
      if (!isNaN(expensasNum)) {
        expensasFormatted = `$ ${expensasNum.toLocaleString("es-AR")}`;
      }
    }

    let totalM2: string | null = null;
    if (metros) {
      const metrosNum = parseInt(metros.replace(/\D/g, ""));
      if (!isNaN(metrosNum)) totalM2 = `${metrosNum} m²`;
    }

    let roomsFormatted: string | null = null;
    if (ambientes) {
      const ambientesNum = parseInt(ambientes.replace(/\D/g, ""));
      if (!isNaN(ambientesNum)) roomsFormatted = `${ambientesNum} amb`;
    }

    let bathroomsFormatted: string | null = null;
    if (banos) {
      const banosNum = parseInt(banos.replace(/\D/g, ""));
      if (!isNaN(banosNum))
        bathroomsFormatted = `${banosNum} baño${banosNum !== 1 ? "s" : ""}`;
    }

    const propertySource = (sourceOverride ||
      source ||
      "zonaprop") as PropertySource;

    let images: string[] = [];
    if (imagen) {
      const parts = imagen
        .split("|")
        .map((p) => p.trim())
        .filter(
          (p) => p && (p.startsWith("http://") || p.startsWith("https://"))
        );
      if (parts.length) images = parts;
    }
    console.log("Parsed images:", images);
    const validImage = images.length > 0 ? images[0] : "";

    const isDollar =
      esDolares.toLowerCase().trim() === "true" || esDolares.trim() === "1";

    let isPH = false;
    if (esPHRaw) {
      isPH = esPHRaw.toLowerCase().trim() === "true" || esPHRaw.trim() === "1";
      // explicit PH flag detected
    } else {
      const text = `${direccion} ${descripcion}`.toLowerCase();
      if (/\bph\b/.test(text)) {
        isPH = true;
        // inferred PH from text
      }
    }

    listings.push({
      source: propertySource,
      price: formatPrice(precio, esDolares),
      isDollar,
      isPH,
      expenses: expensasFormatted,
      city: ubicacion || "",
      address: direccion || "",
      totalM2,
      rooms: roomsFormatted,
      bathrooms: bathroomsFormatted,
      description: descripcion || "",
      mainImage: validImage,
      images: images.length ? images : undefined,
      url: url || "",
      publishedDate: fechaPublicacion || null,
    });
  }

  return listings;
}

export async function fetchZonaPropProperties(): Promise<PropertyListing[]> {
  try {
    const csvContent = await fetchCSVFromGitHub("propiedades_zonaprop.csv");
    return parseCSV(csvContent, "zonaprop");
  } catch (error) {
    console.error("Error fetching ZonaProp CSV:", error);
    return [];
  }
}

export async function fetchArgenPropProperties(): Promise<PropertyListing[]> {
  try {
    const csvContent = await fetchCSVFromGitHub("propiedades_argenprop.csv");
    return parseCSV(csvContent, "argenprop");
  } catch (error) {
    console.error("Error fetching ArgenProp CSV:", error);
    return [];
  }
}

export async function fetchAllProperties(options?: {
  force?: boolean;
}): Promise<PropertyListing[]> {
  const force = options?.force === true;
  const now = Date.now();

  if (!force && propertiesCache && propertiesCache.expiresAt > now) {
    return propertiesCache.data;
  }

  const [zonaPropListings, argenPropListings] = await Promise.all([
    fetchZonaPropProperties(),
    fetchArgenPropProperties(),
  ]);
  const combined = [...zonaPropListings, ...argenPropListings].sort((a, b) => {
    if (!a.publishedDate && !b.publishedDate) return 0;
    if (!a.publishedDate) return 1;
    if (!b.publishedDate) return -1;
    if (a.publishedDate === b.publishedDate) return 0;
    return a.publishedDate > b.publishedDate ? -1 : 1;
  });
  propertiesCache = {
    data: combined,
    expiresAt: nextDailyCutoff(),
  };
  return combined;
}
