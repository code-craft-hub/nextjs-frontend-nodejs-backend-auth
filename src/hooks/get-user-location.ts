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
  flag: {
    img: string;
  };
}

const defaultLocation: LocationData = {
  ip: "",
  continent: "",
  continent_code: "",
  country: "",
  country_code: "",
  region: "",
  region_code: "",
  city: "",
  calling_code: "",
  currency: "",
  currency_name: "",
  longitude: "",
  latitude: "",
  postal: "",
  capital: "",
  flag: { img: "" },
};

export const useUserLocation = () => {
  const [location, setLocation] = useState<LocationData>(defaultLocation);

  useEffect(() => {
    const fetchUserLocation = async () => {
      console.log("getUserLocation : ", await getUserLocation());

      try {
        const sources = [fetch("https://ipwho.is/").then((res) => res.json())];
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

        setLocation({
          ...defaultLocation,
          ...merged,
          flag,
        });
      } catch (err) {
        console.error("🌍 Failed to fetch user location:", err);
      }
    };

    fetchUserLocation();
  }, []);

  return {
    ip: location.ip,
    continent: location.continent,
    continent_code: location.continent_code,
    country: location.country,
    country_code: location.country_code,
    region: location.region,
    currency: location.currency,
    currency_name: location.currency_name,
    region_code: location.region_code,
    latitude: location.latitude,
    longitude: location.longitude,
    city: location.city,
    calling_code: location.calling_code,
    postal: location.postal,
    capital: location.capital,
    flag: location.flag.img,
  };
};
