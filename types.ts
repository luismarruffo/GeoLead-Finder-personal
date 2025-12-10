export interface SearchParams {
  city: string;
  country: string;
  keyword: string;
  limit: number;
  instructions?: string;
}

export interface Lead {
  id: string;
  name: string;
  category: string;
  keywords: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  mapsLink: string;
}

export interface ParseResult {
  leads: Lead[];
  rawText: string;
}