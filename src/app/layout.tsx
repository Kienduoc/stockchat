import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
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
      lang="vi"
      className={`dark ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full text-slate-200">
        {children}
      </body>
    </html>
  );
}
