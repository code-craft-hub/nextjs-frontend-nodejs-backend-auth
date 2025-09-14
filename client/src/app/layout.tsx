import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Next.js Firebase Auth",
  description: "Enterprise-grade authentication with Next.js and Firebase",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
