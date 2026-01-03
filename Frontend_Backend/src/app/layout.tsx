import type { Metadata } from "next";
import "./globals.css";
import PageTransition from "@/components/page-transition";
import SessionProvider from "@/components/SessionProvider";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { headers } from "next/headers";
import { IBM_Plex_Sans, Playfair_Display } from "next/font/google";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

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
      { url: "/logo_black.png" },
      { url: "/logo_black.png", sizes: "16x16", type: "image/png" },
      { url: "/logo_black.png", sizes: "32x32", type: "image/png" },
      { url: "/logo_black.png", sizes: "192x192", type: "image/png" },
      { url: "/logo_black.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: "/logo_black.png",
    apple: "/logo_black.png",
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
        url: "https://algogrid.dev/bg_white.png",
        width: 1200,
        height: 630,
        alt: "AlgoGrid - Master DSA Patterns & Coding Challenges",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlgoGrid - Master DSA Patterns & Coding Challenges",
    description: "Learn Data Structures and Algorithms systematically. Practice 265+ problems organized by patterns and explore company-specific questions to ace your coding interviews.",
    images: ["https://algogrid.dev/bg_white.png"],
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
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';
  const isLoginPage = pathname.includes('/login');
  
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
    <html lang="en">
      <head>
        <title>AlgoGrid - Master DSA Patterns & Coding Challenges</title>
        <link rel="icon" type="image/png" href="/logo_black.png" />
        <link rel="apple-touch-icon" href="/logo_black.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
      </head>
      <body className="text-black dark:text-white transition-colors">
        <SessionProvider>
          <ThemeProvider>
            <div className="relative z-10 min-h-screen w-full">
              <PageTransition>
                {children}
                {!isLoginPage && <Footer/>}
              </PageTransition>
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
