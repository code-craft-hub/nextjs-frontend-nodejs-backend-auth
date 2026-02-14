
type ProviderResult = {
  provider: string;
  data: Record<string, unknown>;
  error?: string;
};

const PROVIDERS = [
  {
    name: "ipapi",
    url: "https://ipapi.co/json/",
  },
  {
    name: "ipwho",
    url: "https://ipwho.is/",
  },
  {
    name: "freeipapi",
    url: "https://freeipapi.com/api/json",
  },
] as const;

async function fetchProvider(
  provider: (typeof PROVIDERS)[number],
  timeoutMs = 5000,
): Promise<ProviderResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(provider.url, {
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

export async function getUserLocation(): Promise<IpLocation> {
  const results = await Promise.allSettled(
    PROVIDERS.map((p) => fetchProvider(p)),
  );

  let merged: IpLocation = {};

  for (const r of results) {
    if (r.status === "fulfilled") {
      merged = {
        ...merged,
        ...r.value.data,
      };
    }
  }

  return merged;
}

export function mapIpLocationToCountry(params: {
  userId: string;
  location: IpLocation;
}) {
  const { userId, location } = params;

  if (!location.country || !location.country_code) {
    throw new Error("Invalid IP location: country data missing");
  }

  return {
    userId,

    // REQUIRED
    name: location.country,
    code:
      location.country_code.length === 3
        ? location.country_code
        : (location.countryCode ?? ""),
    code2: location.country_code,

    // OPTIONAL / NORMALIZED
    capital: location.capital,
    region: location.region,
    latitude: location.latitude,
    longitude: location.longitude,

    phoneCode: location.calling_code,
    currency: location.currencies?.[0],
    flagEmoji: location.flag?.emoji,
    flagUrl: location.flag?.img,

    isActive: true,

    // nativeName: "",
    // subregion: "",
    currencyName: location?.currencies?.[0],
    // currencySymbol: "",
  };
}



export type FlagInfo = {
  img: string;
  emoji: string;
  emoji_unicode: string;
};

export type ConnectionInfo = {
  asn: number;
  org: string;
  isp: string;
  domain: string;
};

export type TimezoneInfo = {
  id: string;
  abbr: string;
  is_dst: boolean;
  offset: number; // seconds
  utc: string;
  current_time: string; // ISO-8601
};

export type RawIpLocation = {
  ip: string;
  success: boolean;
  type: "IPv4" | "IPv6";

  continent?: string;
  continent_code?: string;
  country?: string;
  country_code?: string;
  region?: string;
  region_code?: string;
  city?: string;
  postal?: string;

  latitude: number;
  longitude: number;
  is_eu?: boolean;

  calling_code?: string;
  capital?: string;
  borders?: string;

  flag?: FlagInfo;
  connection?: ConnectionInfo;
  timezone?: TimezoneInfo;

  ipVersion?: number;
  ipAddress?: string;

  countryName?: string;
  countryCode?: string;

  phoneCodes?: number[];
  timeZones?: string[];

  zipCode?: string;
  cityName?: string;
  regionName?: string;
  regionCode?: string | null;
  continentCode?: string;

  currencies?: string[];
  languages?: string[];

  asn?: string;
  asnOrganization?: string;

  isProxy?: boolean;
};

export type IpLocation = Partial<RawIpLocation> 