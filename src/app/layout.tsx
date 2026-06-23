import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Market Sentiment - Stock & Crypto News Feed",
  description: "Real-time market sentiment tracker for stocks and crypto. Vote long/short and share insights with the community.",
  keywords: ["stocks", "crypto", "bitcoin", "trading", "market sentiment", "news"],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 shadow-lg sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h1 className="text-2xl font-bold text-white">Market Sentiment</h1>
                  <p className="text-blue-100 text-xs">Stock & Crypto News Feed</p>
                </div>
              </div>
              <div className="text-blue-100 text-sm">
                Vote • Comment • Discover Trends 🚀
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Market Sentiment © 2024 • Real-time sentiment tracking</p>
            <p className="mt-2 text-xs">Data updated every 30 seconds • Community-driven insights</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
