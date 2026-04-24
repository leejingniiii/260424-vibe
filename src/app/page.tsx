"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Sparkles } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "검색에 실패했습니다");
      }

      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (imageUrl: string) => {
    if (!imageUrl) return;
    router.push(`/color?img=${encodeURIComponent(imageUrl)}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4 animate-fade-in pt-12">
          <div className="inline-flex items-center justify-center p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-pink-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            꼭 맞는 <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">나만의 컬러 찾기</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            원하는 뷰티 제품을 검색하고 핵심 색상(Dominant Color)을 추출하여 그에 어울리는 찰떡 제품을 추천받아 보세요.
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto animate-fade-in relative group" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-4 rounded-2xl border-2 border-transparent bg-white dark:bg-gray-800 shadow-lg focus:border-pink-300 focus:ring-4 focus:ring-pink-100 dark:focus:ring-pink-900/40 outline-none transition-all text-lg"
            placeholder="예: 맥 루비우 립스틱"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute inset-y-2 right-2 px-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center disabled:hover:from-pink-500"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "검색"}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center max-w-xl mx-auto">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {results.map((product) => (
            product.thumbnail && (
              <div
                key={product.id}
                onClick={() => handleProductSelect(product.thumbnail)}
                className="group glass-panel rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-800"
              >
                <div className="p-4 bg-white flex justify-center items-center h-56 w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 space-y-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-semibold uppercase tracking-wider text-pink-500">
                    {product.source}
                  </span>
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {product.title}
                  </h3>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {product.price || product.extracted_price}
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </main>
  );
}
