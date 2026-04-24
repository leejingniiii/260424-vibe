import { NextResponse } from "next/server";
import { getJson } from "serpapi";
import { getColor } from "colorthief";
import fs from "fs";
import path from "path";
import os from "os";
import chroma from "chroma-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hex = searchParams.get("hex");
  const category = searchParams.get("category");

  if (!hex || !category) {
    return NextResponse.json({ error: "Missing hex or category parameter" }, { status: 400 });
  }

  let results: any[] = [];
  
  if (!process.env.SERPAPI_KEY) {
    console.warn("No SERPAPI_KEY found, returning mock data for recommendations.");
    results = [
      { id: "r1", title: `Mock ${category} 1`, source: "Sephora", price: "$20", thumbnail: "https://placehold.co/400x400/cc0000/ffffff.png?text=Item+A", link: "#" },
      { id: "r2", title: `Mock ${category} 2`, source: "Ulta", price: "$22", thumbnail: "https://placehold.co/400x400/ff66b2/ffffff.png?text=Item+B", link: "#" },
      { id: "r3", title: `Mock ${category} 3`, source: "Mac", price: "$18", thumbnail: "https://placehold.co/400x400/993333/ffffff.png?text=Item+C", link: "#" },
      { id: "r4", title: `Mock ${category} 4`, source: "Nars", price: "$30", thumbnail: "https://placehold.co/400x400/ff9999/ffffff.png?text=Item+D", link: "#" },
      { id: "r5", title: `Mock ${category} 5`, source: "Fenty", price: "$25", thumbnail: "https://placehold.co/400x400/ff3366/ffffff.png?text=Item+E", link: "#" },
      { id: "r6", title: `Mock ${category} 6`, source: "Dior", price: "$40", thumbnail: "https://placehold.co/400x400/cc3366/ffffff.png?text=Item+F", link: "#" },
      { id: "r7", title: `Mock ${category} 7`, source: "Chanel", price: "$45", thumbnail: "https://placehold.co/400x400/aa0033/ffffff.png?text=Item+G", link: "#" },
    ];
  } else {
    try {
      const response = await getJson({
        engine: "google_shopping",
        q: category,
        hl: "en",
        gl: "us",
        api_key: process.env.SERPAPI_KEY,
      });
      results = response.shopping_results || [];
    } catch (err) {
      console.error("SerpAPI Error:", err);
      return NextResponse.json({ error: "Failed to fetch from Google Shopping" }, { status: 500 });
    }
  }

  try {
    
    // Process top 12 items to save execution time
    const itemsToProcess = results.slice(0, 15);

    // 2. Fetch and Extract distinct colors for each
    const extractionPromises = itemsToProcess.map(async (item: any) => {
      try {
        if (!item.thumbnail) return null;
        
        const imgRes = await fetch(item.thumbnail);
        if (!imgRes.ok) return null;
        
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `rec-${Date.now()}-${Math.floor(Math.random()*10000)}.jpg`);
        fs.writeFileSync(tempFilePath, buffer);
        
        const color = await getColor(tempFilePath);
        fs.unlinkSync(tempFilePath);
        
        if (!color) return null;
        
        const extractedHex = rgbToHex(color[0], color[1], color[2]);
        const deltaE = chroma.deltaE(hex, extractedHex);
        
        return {
          id: item.product_id || item.position,
          title: item.title,
          source: item.source,
          price: item.price,
          thumbnail: item.thumbnail,
          link: item.link,
          extracted_color: extractedHex,
          deltaE: deltaE
        };
      } catch (err) {
        return null;
      }
    });

    const processedItems = (await Promise.all(extractionPromises)).filter(item => item !== null);

    // 3. Sort by Delta-E similarity (lower is similar, so ascending)
    // Wait, complement colors or same colors? The prompt says "find complementary products ... based on color similarity (Delta-E)". Similarity means we want Delta-E nearest to 0. 
    processedItems.sort((a, b) => (a?.deltaE ?? Infinity) - (b?.deltaE ?? Infinity));

    // 4. Return top 9
    return NextResponse.json({ results: processedItems.slice(0, 9) });

  } catch (error) {
    console.error("Recommend API Error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");
}
