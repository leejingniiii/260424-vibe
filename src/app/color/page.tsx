"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowRight, Pipette } from "lucide-react";
import chroma from "chroma-js";

function ColorExtractionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dominantHex, setDominantHex] = useState<string>("");
  const [palette, setPalette] = useState<string[]>([]);
  const [selectedHex, setSelectedHex] = useState<string>("");

  useEffect(() => {
    let finalImageUrl = null;
    try {
      finalImageUrl = sessionStorage.getItem("selectedProductImage") || searchParams.get("img");
    } catch (e) {
      finalImageUrl = searchParams.get("img");
    }

    if (!finalImageUrl) {
      router.push("/");
      return;
    }
    
    setImageUrl(finalImageUrl);

    const extractColor = async () => {
      try {
        const res = await fetch("/api/extract-color", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: finalImageUrl }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        const baseColor = data.hex;
        setDominantHex(baseColor);
        setSelectedHex(baseColor);

        // Generate 7 similar/complementary colors using chroma.js
        // We'll create a nice range varying slightly in hue and lightness
        const base = chroma(baseColor);
        const generatedColors = [
          base.darken(1).hex(),
          base.brighten(0.5).hex(),
          base.set('hsl.h', '+15').hex(),
          baseColor,  // Center
          base.set('hsl.h', '-15').hex(),
          base.saturate(1).hex(),
          base.desaturate(1).hex(),
        ];
        
        setPalette(generatedColors);
      } catch (err: any) {
        setError(err.message || "Failed to extract color");
      } finally {
        setLoading(false);
      }
    };

    extractColor();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-pink-100 rounded-full animate-spin border-t-pink-500"></div>
          <Pipette className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-pink-500 w-8 h-8" />
        </div>
        <p className="text-gray-500 font-medium animate-pulse">DNA 색상 분석 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 text-red-500 rounded-2xl max-w-lg mx-auto mt-12">
        <p>{error}</p>
        <button onClick={() => router.push("/")} className="mt-4 underline hover:text-red-700">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pt-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
          색상 추출 완료
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          대표 톤을 찾았습니다. 미세한 색상 조정을 원하시면 추천 팔레트에서 선택해 주세요.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Image */}
        <div className="glass-panel p-8 rounded-3xl flex justify-center items-center bg-white dark:bg-gray-800 shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl!} alt="Selected Product" className="max-h-80 object-contain drop-shadow-xl" />
        </div>

        {/* Right: Color Selection */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">선택한 색상</h3>
            <div className="flex items-center space-x-4">
              <div
                className="w-24 h-24 rounded-2xl shadow-lg border-4 border-white dark:border-gray-700 transition-colors duration-300"
                style={{ backgroundColor: selectedHex }}
              />
              <div className="text-3xl font-mono uppercase font-bold text-gray-800 dark:text-white">
                {selectedHex}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">추천 컬러 팔레트</h3>
            <div className="flex flex-wrap gap-4">
              {palette.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedHex(color)}
                  className={`w-14 h-14 rounded-full shadow-md transform transition-all duration-200 hover:scale-110 focus:outline-none ${
                    selectedHex === color ? 'ring-4 ring-offset-2 ring-pink-400 scale-110 dark:ring-offset-gray-900' : 'hover:ring-2 ring-offset-1 ring-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => router.push(`/category?hex=${encodeURIComponent(selectedHex)}`)}
            className="w-full py-4 px-6 bg-gray-900 hover:bg-gray-800 dark:bg-pink-500 dark:hover:bg-pink-600 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 group"
          >
            <span>이 색상으로 매칭하기</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ColorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <Suspense fallback={<div className="text-center pt-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-pink-500"/></div>}>
        <ColorExtractionContent />
      </Suspense>
    </main>
  );
}
