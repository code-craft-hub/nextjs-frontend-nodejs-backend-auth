import type { Metadata } from "next";
import { Archivo, Geist, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// The base `font-sans`. The landing page renders entirely in `font-marketing`,
// so Geist is only fetched if something outside it actually uses it.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

/** Marketing copy — `font-marketing`. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

/** Marketing headlines — `font-display`. */
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cver AI — Join the waitlist",
  description:
    "Find local roles, build the right connections, and get seen by recruiters in your new country.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${archivo.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
