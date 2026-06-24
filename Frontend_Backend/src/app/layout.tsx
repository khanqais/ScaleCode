import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "optional",
  variable: "--font-montserrat",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "optional",
  variable: "--font-playfair",
});
import PageTransition from "@/components/page-transition";
import SessionProvider from "@/components/SessionProvider";
import ConditionalFooter from "@/components/ConditionalFooter";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SpeedInsights } from "@vercel/speed-insights/next"


export const metadata: Metadata = {
  title: "AlgoGrid - Master DSA Patterns & Coding Challenges",
  description: "Learn Data Structures and Algorithms systematically. Practice 265+ problems organized by patterns and explore company-specific questions to ace your coding interviews.",
  keywords: ["DSA", "Data Structures", "Algorithms", "LeetCode", "Coding Challenges", "Interview Prep", "AlgoGrid"],
  authors: [{ name: "AlgoGrid" }],
  creator: "AlgoGrid",
  metadataBase: new URL("https://algogrid.dev"),
  verification: {
    google: "ZdW69PAoGjfGt7fzGGUe-syWf4phn77yt3XmADC3Gwg",
  },
  icons: {
    icon: [
      { url: "/logo_black.webp" },
      { url: "/logo_black.webp", sizes: "16x16", type: "image/webp" },
      { url: "/logo_black.webp", sizes: "32x32", type: "image/webp" },
      { url: "/logo_black.webp", sizes: "192x192", type: "image/webp" },
      { url: "/logo_black.webp", sizes: "512x512", type: "image/webp" }
    ],
    shortcut: "/logo_black.webp",
    apple: "/logo_black.webp",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://algogrid.dev",
    siteName: "AlgoGrid",
    title: "AlgoGrid - Master DSA Patterns & Coding Challenges",
    description: "Learn Data Structures and Algorithms systematically. Practice 265+ problems organized by patterns and explore company-specific questions to ace your coding interviews.",
    images: [
      {
        url: "https://algogrid.dev/bg_white.webp",
        width: 1200,
        height: 630,
        alt: "AlgoGrid - Master DSA Patterns & Coding Challenges",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlgoGrid - Master DSA Patterns & Coding Challenges",
    description: "Learn Data Structures and Algorithms systematically. Practice 265+ problems organized by patterns and explore company-specific questions to ace your coding interviews.",
    images: ["https://algogrid.dev/bg_white.webp"],
    creator: "@algogrid",
    site: "@algogrid",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://algogrid.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AlgoGrid",
    "url": "https://algogrid.dev",
    "description": "Learn Data Structures and Algorithms systematically. Practice 265+ problems organized by patterns.",
    "applicationCategory": "EducationalApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "265"
    }
  };

  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`}>
      <head>
        <title>AlgoGrid - Master DSA Patterns &amp; Coding Challenges</title>

        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
        <link rel="icon" type="image/webp" href="/logo_black.webp" />
        <link rel="apple-touch-icon" href="/logo_black.webp" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
      </head>
      <body className="font-normal text-black dark:text-white transition-colors">
        {/* Universal Background grids */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10"></div>
        
        <SessionProvider>
          <ThemeProvider>
            <div className="relative min-h-screen w-full">
              <PageTransition>
                {children}
                <ConditionalFooter />
              </PageTransition>
            </div>
          </ThemeProvider>
        </SessionProvider>
        <SpeedInsights /> 
      </body>
    </html>
  );
}
