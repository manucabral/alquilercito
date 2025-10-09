export type PropertySource = "zonaprop" | "argenprop" | "remax";

export type PropertyListing = {
  source: PropertySource;
  price: string;
  isDollar: boolean;
  isPH: boolean;
  expenses: string | null;
  city: string;
  address: string;
  totalM2: string | null;
  rooms: string | null;
  bathrooms: string | null;
  description: string;
  mainImage: string;
  images?: string[];
  url: string;
  publishedDate: string | null;
};
