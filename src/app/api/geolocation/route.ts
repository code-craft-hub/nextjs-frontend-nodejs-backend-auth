import { NextRequest, NextResponse } from "next/server";

type ProviderResult = {
  provider: string;
  data: Record<string, unknown>;
  error?: string;
};

const PROVIDERS = [
  {
    name: "ipapi",
    getUrl: (ip: string) => `https://ipapi.co/${ip}/json/`,
  },
  {
    name: "ipwho",
    getUrl: (ip: string) => `https://ipwho.is/${ip}`,
  },
  {
    name: "freeipapi",
    getUrl: (ip: string) => `https://freeipapi.com/api/json/${ip}`,
  },
] as const;

async function fetchProvider(
  provider: (typeof PROVIDERS)[number],
  ip: string,
  timeoutMs = 5000,
): Promise<ProviderResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(provider.getUrl(ip), {
      signal: controller.signal,
      headers: {
        accept: "application/json",
      },
    });

    if (!res.ok) {
      return {
        provider: provider.name,
        data: {},
        error: `HTTP ${res.status}`,
      };
    }

    return {
      provider: provider.name,
      data: await res.json(),
    };
  } catch (err) {
    return {
      provider: provider.name,
      data: {},
      error: err instanceof Error ? err.message : "Unknown error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * ipwho.is returns `country` as a nested object: { code, name, capital, ... }
 * ipapi.co returns `country_name` as a plain string.
 * Extract the string name from whichever shape is present.
 */
function extractCountryName(data: Record<string, unknown>): string {
  if (data.country_name && typeof data.country_name === "string")
    return data.country_name;
  if (data.countryName && typeof data.countryName === "string")
    return data.countryName;
  if (data.country) {
    if (typeof data.country === "string") return data.country;
    if (typeof data.country === "object" && data.country !== null) {
      const c = data.country as Record<string, unknown>;
      if (typeof c.name === "string") return c.name;
    }
  }
  return "";
}

/**
 * ipwho.is returns `country` as a nested object — preserve it as raw metadata
 * so callers can store enriched geo data (capital, currency, phone_code, etc.)
 * without corrupting the plain-string `country` field.
 */
function extractCountryMetadata(
  data: Record<string, unknown>,
): Record<string, unknown> | null {
  if (typeof data.country === "object" && data.country !== null) {
    return data.country as Record<string, unknown>;
  }
  return null;
}

function extractCountryCode(data: Record<string, unknown>): unknown {
  // ipwho.is nests the code inside the country object
  if (typeof data.country === "object" && data.country !== null) {
    const c = data.country as Record<string, unknown>;
    return c.code || data.country_code || data.countryCode;
  }
  return data.country_code || data.countryCode;
}

function normalizeLocationData(
  data: Record<string, unknown>,
): Record<string, unknown> {
  return {
    countryCode: extractCountryCode(data),
    countryName: extractCountryName(data),
    // Raw enriched metadata (capital, currency, phone_code, etc.) when available
    countryMetadata: extractCountryMetadata(data),
    regionCode: data.region_code || data.regionCode,
    regionName:
      typeof data.region === "string"
        ? data.region
        : data.regionName || "",
    cityName: data.city || data.cityName,
    zipCode: data.postal_code || data.postal || data.zipCode,
    latitude: data.latitude,
    longitude: data.longitude,
    ip: data.ip || data.ipAddress,
  };
}

export async function GET(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "";

    const results = await Promise.allSettled(
      PROVIDERS.map((p) => fetchProvider(p, ip)),
    );

    let merged: Record<string, unknown> = {};

    for (const r of results) {
      if (r.status === "fulfilled" && r.value.data) {
        // First-wins: earlier providers (ipapi) take precedence over later ones
        // (ipwho) so a clean string value is never overwritten by an object value.
        merged = {
          ...r.value.data,
          ...merged,
        };
      }
    }

    // Normalize the merged data to consistent field names
    const normalized = normalizeLocationData(merged);

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("Geolocation API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch geolocation data" },
      { status: 500 },
    );
  }
}
