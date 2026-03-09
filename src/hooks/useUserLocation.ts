import { useEffect, useState } from "react";

export interface UserLocation {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}


const FETCH_TIMEOUT = 4000;

async function fetchWithTimeout<T>(url: string): Promise<T> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, FETCH_TIMEOUT);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Providers chosen because they:
 * - support browser CORS
 * - have global coverage
 * - require no API key
 */
async function getLocation(): Promise<UserLocation> {
  const providers = [
    async () => {
      const data = await fetchWithTimeout<any>("https://ipapi.co/json/");

      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country_name,
        countryCode: data.country_code,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      };
    },

    async () => {
      const data = await fetchWithTimeout<any>("https://ipinfo.io/json");

      const [lat, lon] = (data.loc ?? "").split(",");

      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country,
        latitude: lat ? Number(lat) : undefined,
        longitude: lon ? Number(lon) : undefined,
        timezone: data.timezone,
      };
    },
  ];

  for (const provider of providers) {
    try {
      const result = await provider();
      if (result.country) return result;
    } catch {
      continue;
    }
  }

  throw new Error("All location providers failed");
}

export function useUserLocation(): UserLocation | null {
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    let mounted = true;

    getLocation()
      .then((loc) => {
        if (mounted) {
          setLocation(loc);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  return location;
}
