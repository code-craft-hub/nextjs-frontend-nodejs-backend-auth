import ReactGA from "react-ga4";

export const initGA = () => {
  const GA_MEASUREMENT_ID =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-CDMCYEXE2W";
    
  if (typeof window !== "undefined" && GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      gaOptions: {
        siteSpeedSampleRate: 100,
      },
    });
  }
};

export const logPageView = (url: string, title: string) => {
  if (typeof window !== "undefined") {
    ReactGA.send({
      hitType: "pageview",
      page: url,
      title: title,
    });
  }
};

export const logEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== "undefined") {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};


export const logUserActivityToGoogle = ({
  page,
  userEvent,
  description,
}: {
  page: string;
  userEvent: string;
  description: string;
}) => {
  logEvent(page, userEvent, description);
};
