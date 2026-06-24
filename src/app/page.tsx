'use client';

import LiveTicker from '@/components/LiveTicker';

const features = [
  { icon: '📈', title: 'Chart LIVE đầy đủ khung', desc: 'Biểu đồ nến real-time 1m → 1d cho 1.528 cổ phiếu VN và 437 cặp crypto.' },
  { icon: '💬', title: 'Chat Long/Short tức thì', desc: 'Thảo luận từng mã, vote Long/Short, xem tâm lý cộng đồng theo thời gian thực.' },
  { icon: '🔥', title: 'Tin nóng lan nhanh nhất', desc: 'Nơi tin đồn, thông tin nóng được chia sẻ và lan tỏa nhanh trong cộng đồng.' },
  { icon: '🏆', title: 'Track record Cao thủ', desc: 'Đăng tin, cộng đồng vote Đúng/Sai → ai đoán chuẩn lên hạng, lọc tin chất lượng.' },
];

const security = [
  { icon: '🔐', title: 'Đăng nhập Google an toàn', desc: 'OAuth 2.0 chuẩn quốc tế. Không lưu mật khẩu, không rò rỉ dữ liệu.' },
  { icon: '🛡️', title: 'Hạ tầng Supabase mã hóa', desc: 'Dữ liệu mã hóa TLS, Row Level Security bảo vệ từng dòng dữ liệu.' },
  { icon: '⚡', title: 'Dữ liệu nguồn chính thống', desc: 'Giá từ VNDirect & Binance — minh bạch, real-time, không qua trung gian.' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '8s' }} />
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="glass sticky top-0 z-50 border-x-0 border-t-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-lg shadow-lg shadow-emerald-500/30">📈</span>
              <span className="font-display text-xl font-extrabold text-white">StockChat <span className="text-emerald-400">VN</span></span>
            </div>
            <div className="flex items-center gap-3">
              <a href="#features" className="hidden md:block text-slate-300 hover:text-white text-sm">Tính năng</a>
              <a href="#security" className="hidden md:block text-slate-300 hover:text-white text-sm">Bảo mật</a>
              <a href="/app" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                Vào App →
              </a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-16 text-center">
          <div className="animate-float-up">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 text-sm text-emerald-300">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Real-time • Miễn phí • Cộng đồng
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-white">
              Nơi tin nóng thị trường<br />
              <span className="text-gradient">lan nhanh nhất</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Chart LIVE cổ phiếu Việt Nam &amp; crypto, thảo luận Long/Short tức thì với cộng đồng.
              Nơi dễ nhất để bắt thông tin mới nhất, nóng nhất.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a href="/app" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-8 py-3.5 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/30">
                🚀 Vào App miễn phí
              </a>
              <a href="#features" className="glass hover:bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-all">
                Xem tính năng
              </a>
            </div>
          </div>

          <div className="animate-float-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-slate-400 text-sm mb-3">💹 Giá đang cập nhật trực tiếp</p>
            <LiveTicker />
          </div>
        </section>

        {/* Trust indicators */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="glass rounded-2xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: '1.528', label: 'Cổ phiếu VN' },
              { num: '437', label: 'Cặp Crypto' },
              { num: '24/7', label: 'Chat cộng đồng' },
              { num: '100%', label: 'Miễn phí' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 font-display">{s.num}</div>
                <div className="text-slate-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-white">Tất cả trong một nơi</h2>
          <p className="text-slate-400 text-center mb-12">Công cụ cộng đồng đầu tư mạnh mẽ, tốc độ, miễn phí</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-white">{f.title}</h3>
                <p className="text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section id="security" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4 text-sm text-cyan-300">
              🛡️ An toàn &amp; Minh bạch
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Bảo mật là ưu tiên số 1</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Dữ liệu của bạn được bảo vệ bằng công nghệ mã hóa chuẩn ngân hàng
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {security.map((s) => (
              <div key={s.title} className="glass rounded-2xl p-6 text-center transition-all duration-300 hover:scale-[1.02]">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-white">{s.title}</h3>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white">
            Tham gia <span className="text-gradient">cộng đồng</span> ngay
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Miễn phí 100%. Không cần thẻ tín dụng. Đăng nhập Google là dùng được ngay.
          </p>
          <a href="/app" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-10 py-4 rounded-xl text-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/30">
            🚀 Bắt đầu miễn phí
          </a>
        </section>

        <footer className="border-t border-white/10 py-8 text-center text-slate-500 text-sm">
          <p>StockChat VN © 2026 — Cộng đồng chia sẻ thông tin thị trường</p>
          <p className="mt-2 text-xs">Dữ liệu từ VNDirect &amp; Binance • Không phải lời khuyên đầu tư</p>
        </footer>
      </div>
    </div>
  );
}
