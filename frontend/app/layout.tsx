import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GuidedTour } from "@/components/GuidedTour";

export const metadata: Metadata = {
  title: "THE SILENCE INDEX — Cultural Collection Auditing Platform",
  description: "Because what is missing from history matters too. Auditing metadata completeness for Indian cultural heritage.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body className="bg-cream-100 text-oxblood-900 antialiased selection:bg-gold-400 selection:text-oxblood-950 flex flex-col min-h-screen overflow-x-hidden">
        {/* Skip to Main Content Link for A11y */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold-400 focus:text-oxblood-950 focus:font-bold focus:shadow-md"
        >
          Skip to main content
        </a>

        <Navbar />
        <GuidedTour />

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
