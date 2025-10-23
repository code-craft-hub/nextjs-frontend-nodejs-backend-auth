import { Providers } from "@/providers/query-provider";
import "./globals.css";
import {
  EB_Garamond,
  Epilogue,
  Instrument_Sans,
  Inter,
  Merriweather,
  Outfit,
  Plus_Jakarta_Sans,
  Poppins,
  Roboto,
  Geist,
} from "next/font/google";
import { Metadata } from "next";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
});
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});
const epilogue = Epilogue({ subsets: ["latin"], variable: "--font-epilogue" });
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
});
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});
const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto" });

export const metadata: Metadata = {
  title: "Career Platform",
  description: "Manage your career documents and interview prep",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`
      ${ebGaramond.variable}
      ${epilogue.variable}
      ${instrumentSans.variable}
      ${inter.variable}
      ${merriweather.variable}
      ${outfit.variable}
      ${plusJakartaSans.variable}
      ${poppins.variable}
      ${roboto.variable}
      ${geist.variable}
    `}
      suppressHydrationWarning={true}
    >
      <head>
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link
          rel="dns-prefetch"
          href="https://identitytoolkit.googleapis.com"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
