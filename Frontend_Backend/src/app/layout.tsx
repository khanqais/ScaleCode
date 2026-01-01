import type { Metadata } from "next";
import "./globals.css";
import PageTransition from "@/components/page-transition";
import SessionProvider from "@/components/SessionProvider";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "AlgoGrid",
  description: "Save and organize your LeetCode, HackerRank, and coding platform solutions",
  icons:{
    icon:'/logo_black.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-black dark:text-white transition-colors">
        <SessionProvider>
          <ThemeProvider>
            <div className="relative z-10 min-h-screen w-full">
              <PageTransition>
                {children}
                <Footer/>
              </PageTransition>
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
