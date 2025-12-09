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
        baseTheme: undefined,
        variables: {
          colorPrimary: '#14b8a6',
          colorBackground: '#1f2937',
          colorInputBackground: '#111827',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: '#9ca3af',
          colorNeutral: '#ffffff',
        },
        elements: {
          formButtonPrimary: "bg-teal-600 hover:bg-teal-700 text-white text-sm normal-case",
          card: "bg-gray-800 border-gray-700 shadow-xl",
          rootBox: "bg-transparent",
          modalBackdrop: "backdrop-blur-sm bg-black/80",
          modalContent: "bg-gray-800 rounded-2xl shadow-2xl border border-gray-700",
          headerTitle: "text-white text-2xl font-bold",
          headerSubtitle: "text-gray-300",
          socialButtonsBlockButton: "border border-gray-600 hover:bg-gray-700 text-white",
          socialButtonsBlockButtonText: "text-white font-medium",
          formFieldInput: "bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-white",
          formFieldLabel: "text-gray-300",
          formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-200",
          footerActionLink: "text-teal-400 hover:text-teal-300",
          identityPreviewText: "text-gray-300",
          dividerLine: "bg-gray-600",
          dividerText: "text-gray-400",
          formFieldAction: "text-teal-400 hover:text-teal-300",
          modalCloseButton: "text-gray-400 hover:text-white",
        },
      }}
    >
      <html lang="en">
        <body className="text-black dark:text-white transition-colors">
          <ThemeProvider>
            <div className="relative z-10 min-h-screen w-full">
              <PageTransition>
                {children}
                <Footer/>
              </PageTransition>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
