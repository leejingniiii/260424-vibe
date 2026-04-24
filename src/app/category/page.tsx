"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, Paintbrush } from "lucide-react";

const CATEGORIES = [
  { id: "blush", label: "블러셔", icon: "🌸" },
  { id: "eyeshadow", label: "아이섀도", icon: "✨" },
  { id: "lipstick", label: "립스틱", icon: "💄" }
];

function CategoryContent() {
  const searchParams = useSearchParams();
  const hex = searchParams.get("hex");
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>("blush");

  if (!hex) {
    if (typeof window !== "undefined") {
      router.push("/");
    }
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-fade-in pt-12">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 rounded-full shadow-inner" style={{ backgroundColor: hex }} />
          <div className="text-xl font-mono font-bold text-gray-700 dark:text-gray-200">{hex}</div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
          카테고리 선택
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          이 색상과 매칭할 메이크업 카테고리를 선택해 주세요.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`relative p-8 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center space-y-4 group overflow-hidden ${
              selectedCategory === cat.id
                ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-pink-100 dark:shadow-none shadow-xl scale-105'
                : 'border-transparent bg-white dark:bg-gray-800 hover:border-pink-200 hover:shadow-lg dark:hover:border-gray-600'
            }`}
          >
            <div className="text-5xl group-hover:scale-110 transition-transform">{cat.icon}</div>
            <div className={`font-bold text-xl ${selectedCategory === cat.id ? 'text-pink-600 dark:text-pink-400' : 'text-gray-700 dark:text-gray-200'}`}>
              {cat.label}
            </div>
            
            {/* Selection indicator */}
            <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border-2 transition-colors ${
              selectedCategory === cat.id 
                ? 'bg-pink-500 border-pink-500' 
                : 'border-gray-300 dark:border-gray-600'
            }`} />
          </button>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={() => router.push(`/result?hex=${encodeURIComponent(hex)}&category=${selectedCategory}`)}
          className="py-4 px-10 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl font-bold text-xl transition-all flex items-center justify-center space-x-3 shadow-lg shadow-pink-200 dark:shadow-none hover:-translate-y-1"
        >
          <span>매칭 아이템 찾기</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <Suspense fallback={<div className="text-center pt-20">Loading...</div>}>
        <CategoryContent />
      </Suspense>
    </main>
  );
}
