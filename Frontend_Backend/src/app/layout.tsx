import type { Metadata } from "next";
import "./globals.css";
import PageTransition from "@/components/page-transition";
import { ClerkProvider } from '@clerk/nextjs'
import Footer from "@/components/footer";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        elements: {
          formButtonPrimary: "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200",
        },
      }}
    >
      <html lang="en">
        <body className="bg-white dark:bg-black text-black dark:text-white min-h-screen transition-colors">
          <ThemeProvider>
            <div className="min-h-screen w-full h-full relative">
              <div className="relative z-10">
                <PageTransition>
                  {children}
                  <Footer/>
                </PageTransition>
              </div>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
