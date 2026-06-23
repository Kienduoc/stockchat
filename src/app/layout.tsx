import type { Metadata, Viewport } from "next";
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
  title: "StockChat VN - Chart LIVE cổ phiếu Việt Nam & Crypto",
  description: "Xem biểu đồ giá LIVE cổ phiếu Việt Nam (HOSE/HNX) và crypto, thảo luận long/short real-time với cộng đồng.",
  keywords: ["chứng khoán", "cổ phiếu việt nam", "crypto", "bitcoin", "HOSE", "VNIndex", "chart live"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
                  <h1 className="text-2xl font-bold text-white">StockChat VN</h1>
                  <p className="text-blue-100 text-xs">Chart LIVE & thảo luận cổ phiếu Việt Nam + Crypto</p>
                </div>
              </div>
              <nav className="flex items-center gap-2">
                <a href="/" className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors">
                  📊 Live Chart
                </a>
                <a href="/news" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors">
                  📰 Tin tức
                </a>
              </nav>
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
