const API_KEY = "579b464db66ec23bdd00000194521d09db5044d07f275333b0e5c02d";
const BASE_URL =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

export interface MarketData {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  arrival_date: string;
  latitude?: string;
  longitude?: string;
  id?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  radiusKm?: number;
}

export interface MarketFilters {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
  location?: Coordinates;
}

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const fetchMarketData = async (
  filters: MarketFilters = {}
): Promise<MarketData[]> => {
  const params = new URLSearchParams({
    "api-key": API_KEY,
    format: "json",
    limit: String(filters.limit || 500),
    offset: String(filters.offset || 0),
  });

  if (filters.state) params.append("filters[state]", filters.state);
  if (filters.district) params.append("filters[district]", filters.district);
  if (filters.market) params.append("filters[market]", filters.market);
  if (filters.commodity)
    params.append("filters[commodity]", filters.commodity);

  try {
    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    const json = await res.json();

    let records = json.records || [];

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      records = records.filter(
        (x: MarketData) =>
          x.market?.toLowerCase().includes(q) ||
          x.state?.toLowerCase().includes(q) ||
          x.district?.toLowerCase().includes(q) ||
          x.commodity?.toLowerCase().includes(q)
      );
    }

    if (filters.location) {
      const { latitude, longitude, radiusKm = 50 } = filters.location;

      records = records.filter((x: MarketData) => {
        if (!x.latitude || !x.longitude) return false;
        const d = calculateDistance(
          latitude,
          longitude,
          Number(x.latitude),
          Number(x.longitude)
        );
        return d <= radiusKm;
      });
    }

    return records;
  } catch (e) {
    console.error("Market API error:", e);
    return [];
  }
};
