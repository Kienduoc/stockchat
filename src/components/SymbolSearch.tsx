'use client';

import { useEffect, useRef, useState } from 'react';
import { SymbolConfig } from '@/lib/symbols';

interface SymbolSearchProps {
  market: 'vn' | 'crypto';
  onSelect: (s: SymbolConfig) => void;
}

export default function SymbolSearch({ market, onSelect }: SymbolSearchProps) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SymbolConfig[]>([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/symbols?market=${market}&q=${encodeURIComponent(q)}`);
        const d = await res.json();
        setResults(d.data || []);
        setTotal(d.total || 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, [q, market]);

  return (
    <div ref={boxRef} className="relative">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={market === 'vn' ? '🔍 Tìm mã CP (VD: FPT, VCB, HPG...)' : '🔍 Tìm coin (VD: BTC, DOGE, PEPE...)'}
        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
      />
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {loading && <p className="p-3 text-sm text-gray-400">Đang tìm...</p>}
          {!loading && results.length === 0 && (
            <p className="p-3 text-sm text-gray-400">Không tìm thấy mã nào</p>
          )}
          {!loading && results.length > 0 && (
            <>
              <p className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100 dark:border-gray-700">
                {total} kết quả {total > 60 && '(hiển thị 60 đầu)'}
              </p>
              {results.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onSelect(s);
                    setOpen(false);
                    setQ('');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-gray-800 dark:text-white">{s.ticker}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{s.label}</span>
                  </div>
                  {s.floor && (
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500">
                      {s.floor}
                    </span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
