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
        {children}
      </body>
    </html>
  );
}
