import UserMenu from "@/components/UserMenu";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/landing" className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h1 className="text-2xl font-bold text-white">StockChat VN</h1>
                <p className="text-blue-100 text-xs">Chart LIVE & thảo luận cổ phiếu Việt Nam + Crypto</p>
              </div>
            </a>
            <div className="flex items-center gap-3">
              <nav className="hidden md:flex items-center gap-2">
                <a href="/" className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors">
                  📊 Live Chart
                </a>
                <a href="/news" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors">
                  📰 Tin tức
                </a>
              </nav>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>StockChat VN © 2026 • Cộng đồng chia sẻ thông tin thị trường</p>
          <p className="mt-2 text-xs">Dữ liệu cập nhật real-time • Cổ phiếu VN (VNDirect) & Crypto (Binance)</p>
        </div>
      </footer>
    </>
  );
}
