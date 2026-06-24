import UserMenu from "@/components/UserMenu";
import NotificationBell from "@/components/NotificationBell";

const NAV = [
  { href: "/app", label: "Chart", icon: "📊" },
  { href: "/hot", label: "Tin Nóng", icon: "🔥" },
  { href: "/leaderboard", label: "Cao thủ", icon: "🏆" },
  { href: "/news", label: "Tin tức", icon: "📰" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 glass border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 shrink-0">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-lg shadow-lg shadow-emerald-500/30">📈</span>
              <span className="font-display text-xl font-extrabold text-white hidden sm:block">
                StockChat <span className="text-emerald-400">VN</span>
              </span>
            </a>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {n.icon} {n.label}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Nav mobile (cuộn ngang) */}
        <nav className="md:hidden flex items-center gap-1 px-3 pb-2 overflow-x-auto">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-300 bg-white/5 whitespace-nowrap"
            >
              {n.icon} {n.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
      </main>

      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-slate-500">
          <p>StockChat VN © 2026 • Cộng đồng chia sẻ thông tin thị trường</p>
          <p className="mt-1 text-xs">Dữ liệu real-time từ VNDirect & Binance • Không phải lời khuyên đầu tư</p>
        </div>
      </footer>
    </>
  );
}
