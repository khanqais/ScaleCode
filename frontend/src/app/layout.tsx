import type { Metadata } from "next";
import "./globals.css";
import PageTransition from "@/components/page-transition";
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: "ScaleCode - Organize Your Coding Solutions",
  description: "Save and organize your LeetCode, HackerRank, and coding platform solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body 
          className="bg-transparent"
          style={{
            background: "radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #14b8a6 100%)",
            minHeight: "100vh"
          }}
        >
          <div className="min-h-screen w-full h-full relative">
            <div className="relative z-10">
              <PageTransition>
                {children}
              </PageTransition>
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
