"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Activity } from "lucide-react";

function ResultContent() {
  const searchParams = useSearchParams();
  const hex = searchParams.get("hex");
  const category = searchParams.get("category");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hex || !category) {
      router.push("/");
      return;
    }

    const fetchRecommendations = async () => {
      try {
        const res = await fetch(`/api/recommend?hex=${encodeURIComponent(hex)}&category=${encodeURIComponent(category)}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setResults(data.results);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [hex, category, router]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 max-w-2xl mx-auto px-4 text-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-pink-100 dark:border-gray-700 rounded-full animate-spin border-t-pink-500"></div>
          <Activity className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-pink-500 w-10 h-10 animate-pulse" />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">색상 분석 중...</h2>
          <p className="text-gray-500 dark:text-gray-400">
            수많은 상품의 고유 색상을 실시간으로 추출하고 비교하고 있습니다. 몇 초 정도 소요됩니다.
          </p>
        </div>
        
        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pt-8 opacity-50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel p-4 rounded-2xl h-48 animate-pulse flex flex-col justify-end space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 text-red-500 rounded-2xl max-w-lg mx-auto mt-12 flex flex-col items-center">
        <p className="mb-6">{error}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-red-100 hover:bg-red-200 rounded-lg font-medium transition-colors">
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {category === "blush" ? "블러셔" : category === "eyeshadow" ? "아이섀도" : "립스틱"} 추천 결과
            </h1>
            <p className="text-gray-500 text-sm">색차(Delta-E)를 이용한 유사도 기준 정렬</p>
          </div>
        </div>

        <div className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl space-x-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">기준 색상:</span>
          <div className="w-8 h-8 rounded-lg shadow-sm border border-black/10" style={{ backgroundColor: hex || "#000" }} />
          <span className="font-mono font-bold text-pink-500">{hex}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {results.map((product, idx) => (
          <div key={product.id} className="group glass-panel rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 relative" style={{ animationDelay: `${idx * 0.1}s` }}>
            
            {/* Absolute badge for Match Confidence */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: product.extracted_color }} />
              <span className="text-xs font-bold font-mono text-gray-700 dark:text-gray-200">
                ΔE: {Math.round(product.deltaE * 10) / 10}
              </span>
            </div>

            <div className="relative h-64 w-full bg-white p-6 flex justify-center items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.thumbnail} alt={product.title} className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
            </div>

            <div className="p-6 flex flex-col flex-grow justify-between space-y-4 border-t border-gray-50 dark:border-gray-700">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-pink-500">
                  {product.source}
                </span>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug">
                  {product.title}
                </h3>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {product.price}
                </div>
                <a 
                  href={product.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && !error && (
        <div className="text-center p-12 text-gray-500">
          해당 색상과 매칭되는 제품을 찾지 못했습니다.
        </div>
      )}
    </div>
  );
}

export default function ResultPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 sm:p-8">
      <Suspense fallback={<div className="text-center pt-20">Loading...</div>}>
        <ResultContent />
      </Suspense>
    </main>
  );
}
