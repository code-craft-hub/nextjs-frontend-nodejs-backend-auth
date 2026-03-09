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

function normalizeLocationData(
  data: Record<string, unknown>,
): Record<string, unknown> {
  return {
    countryCode: data.country_code || data.countryCode || data.country_code,
    countryName:
      data.country_name ||
      data.countryName ||
      data.country ||
      (typeof data.country === "string" ? data.country : ""),
    regionCode: data.region_code || data.regionCode,
    regionName:
      data.region ||
      data.regionName ||
      (typeof data.region === "string" ? data.region : ""),
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
        merged = {
          ...merged,
          ...r.value.data,
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
