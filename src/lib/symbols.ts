export interface SymbolConfig {
  id: string;          // unique key cho chat (vd: "vn:HPG")
  label: string;       // tên công ty
  ticker: string;      // mã (vd: "HPG")
  vndSymbol?: string;  // mã trên VNDirect (cổ phiếu VN)
  binanceSymbol?: string; // mã trên Binance (crypto)
  type: 'vnstock' | 'crypto';
  sector?: string;
  floor?: string;      // HOSE | HNX | UPCOM
}

// Cổ phiếu Việt Nam (nguồn VNDirect - miễn phí, không cần key)
export const VN_SYMBOLS: SymbolConfig[] = [
  { id: 'vn:VCB', label: 'Vietcombank', ticker: 'VCB', vndSymbol: 'VCB', type: 'vnstock', sector: 'Ngân hàng' },
  { id: 'vn:TCB', label: 'Techcombank', ticker: 'TCB', vndSymbol: 'TCB', type: 'vnstock', sector: 'Ngân hàng' },
  { id: 'vn:BID', label: 'BIDV', ticker: 'BID', vndSymbol: 'BID', type: 'vnstock', sector: 'Ngân hàng' },
  { id: 'vn:MBB', label: 'MB Bank', ticker: 'MBB', vndSymbol: 'MBB', type: 'vnstock', sector: 'Ngân hàng' },
  { id: 'vn:HPG', label: 'Hòa Phát', ticker: 'HPG', vndSymbol: 'HPG', type: 'vnstock', sector: 'Thép' },
  { id: 'vn:FPT', label: 'FPT Corp', ticker: 'FPT', vndSymbol: 'FPT', type: 'vnstock', sector: 'Công nghệ' },
  { id: 'vn:VNM', label: 'Vinamilk', ticker: 'VNM', vndSymbol: 'VNM', type: 'vnstock', sector: 'Tiêu dùng' },
  { id: 'vn:MWG', label: 'Thế Giới Di Động', ticker: 'MWG', vndSymbol: 'MWG', type: 'vnstock', sector: 'Bán lẻ' },
  { id: 'vn:VIC', label: 'Vingroup', ticker: 'VIC', vndSymbol: 'VIC', type: 'vnstock', sector: 'Bất động sản' },
  { id: 'vn:VHM', label: 'Vinhomes', ticker: 'VHM', vndSymbol: 'VHM', type: 'vnstock', sector: 'Bất động sản' },
  { id: 'vn:SSI', label: 'Chứng khoán SSI', ticker: 'SSI', vndSymbol: 'SSI', type: 'vnstock', sector: 'Chứng khoán' },
  { id: 'vn:VND', label: 'VNDirect', ticker: 'VND', vndSymbol: 'VND', type: 'vnstock', sector: 'Chứng khoán' },
  { id: 'vn:GAS', label: 'PV Gas', ticker: 'GAS', vndSymbol: 'GAS', type: 'vnstock', sector: 'Năng lượng' },
  { id: 'vn:MSN', label: 'Masan Group', ticker: 'MSN', vndSymbol: 'MSN', type: 'vnstock', sector: 'Tiêu dùng' },
  { id: 'vn:ACB', label: 'ACB', ticker: 'ACB', vndSymbol: 'ACB', type: 'vnstock', sector: 'Ngân hàng' },
  { id: 'vn:DGC', label: 'Hóa chất Đức Giang', ticker: 'DGC', vndSymbol: 'DGC', type: 'vnstock', sector: 'Hóa chất' },
];

// Crypto (nguồn Binance - miễn phí, real-time WebSocket)
export const CRYPTO_SYMBOLS: SymbolConfig[] = [
  { id: 'crypto:BTCUSDT', label: 'Bitcoin', ticker: 'BTC', binanceSymbol: 'BTCUSDT', type: 'crypto' },
  { id: 'crypto:ETHUSDT', label: 'Ethereum', ticker: 'ETH', binanceSymbol: 'ETHUSDT', type: 'crypto' },
  { id: 'crypto:SOLUSDT', label: 'Solana', ticker: 'SOL', binanceSymbol: 'SOLUSDT', type: 'crypto' },
  { id: 'crypto:BNBUSDT', label: 'BNB', ticker: 'BNB', binanceSymbol: 'BNBUSDT', type: 'crypto' },
  { id: 'crypto:XRPUSDT', label: 'XRP', ticker: 'XRP', binanceSymbol: 'XRPUSDT', type: 'crypto' },
  { id: 'crypto:DOGEUSDT', label: 'Dogecoin', ticker: 'DOGE', binanceSymbol: 'DOGEUSDT', type: 'crypto' },
];

export const ALL_SYMBOLS = [...VN_SYMBOLS, ...CRYPTO_SYMBOLS];

export function getSymbolById(id: string): SymbolConfig | undefined {
  return ALL_SYMBOLS.find((s) => s.id === id);
}

// Tạo SymbolConfig từ symbol_id bất kỳ (vd "vn:HPG", "crypto:BTCUSDT")
export function buildSymbolFromId(id: string): SymbolConfig | null {
  const known = getSymbolById(id);
  if (known) return known;
  const [market, code] = id.split(':');
  if (!code) return null;
  if (market === 'vn') {
    return { id, ticker: code, label: code, vndSymbol: code, type: 'vnstock' };
  }
  if (market === 'crypto') {
    return { id, ticker: code.replace('USDT', ''), label: `${code.replace('USDT', '')}/USDT`, binanceSymbol: code, type: 'crypto' };
  }
  return null;
}

// Lấy ticker hiển thị từ symbol_id
export function tickerFromId(id: string): string {
  const [market, code] = id.split(':');
  if (!code) return id;
  return market === 'crypto' ? code.replace('USDT', '') : code;
}

// Map khung thời gian sang resolution của VNDirect
export const VN_RESOLUTION: Record<string, string> = {
  '1m': '1',
  '5m': '5',
  '15m': '15',
  '1h': '60',
  '1d': 'D',
};
