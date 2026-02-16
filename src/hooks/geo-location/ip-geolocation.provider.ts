import { useEffect, useState } from "react";

export function useUserLocation() {
  const [location, setLocation] = useState<IpLocation>({});

  useEffect(() => {
    getUserLocation().then((data) => {

      console.log("Location fetched : ", data);
      setLocation(data);
    });
  }, []);

  return location;
}

export async function getUserLocation(): Promise<IpLocation> {
  try {
    const response = await fetch("/api/geolocation", {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch geolocation: HTTP ${response.status}`);
      return {};
    }

    const data = await response.json();
    return data as IpLocation;
  } catch (err) {
    console.error("Failed to fetch geolocation:", err);
    return {};
  }
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

export type IpLocation = Partial<RawIpLocation>;
