import { useEffect, useState } from "react";
import { getUserLocation } from "./geo-location/ip-geolocation.provider";

interface LocationData {
  ip: string;
  continent: string;
  continent_code: string;
  country: string;
  country_code: string;
  region: string;
  region_code: string;
  city: string;
  calling_code: string;
  currency: string;
  currency_name: string;
  longitude: string;
  latitude: string;
  postal: string;
  capital: string;
  ipAddress: string;
  continentCode: string;
  countryName: string;
  countryCode: string;
  regionName: string;
  regionCode: string;
  cityName: string;
  zipCode: string;
  flag: {
    img: string;
  };
}

export const useUserLocation = () => {
  const [location, setLocation] = useState<Partial<LocationData>>({});

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const sources = [
          fetch("https://ipwho.is/").then((res) => res.json()),
          getUserLocation(),
        ];
        const results = await Promise.allSettled(sources);

        const merged: Partial<LocationData> = {};

        for (const result of results) {
          if (
            result.status === "fulfilled" &&
            typeof result.value === "object"
          ) {
            Object.assign(merged, result.value);
          }
        }

        // Defensive fallback in case `flag` is not present or improperly formatted
        const flag =
          merged.flag && typeof merged.flag === "object" && "img" in merged.flag
            ? merged.flag
            : { img: "" };

        setLocation({ ...merged, flag });
      } catch (err) {
        console.error("🌍 Failed to fetch user location:", err);
      }
    };

    fetchUserLocation();
  }, []);

  return {
    ip: location.ip || location.ipAddress || "",
    continent: location.continent || "",
    continent_code: location.continent_code || location.continentCode || "",
    country: location.country || location.countryName || "",
    country_code: location.country_code || location.countryCode || "",
    countryName: location.country || "",
    region: location.region || location.regionName || "",
    currency: location.currency || "",
    currency_name: location.currency_name || "",
    region_code: location.region_code || location.regionCode || "",
    latitude: location.latitude || "",
    longitude: location.longitude || "",
    city: location.city || location.cityName || "",
    calling_code: location.calling_code || "",
    postal: location.postal || "",
    capital: location.capital || "",
    flag: location.flag?.img || "",
    zipCode: location.postal || location.zipCode || "",
  };
};
