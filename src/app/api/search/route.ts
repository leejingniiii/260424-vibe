import { NextResponse } from "next/server";
import { getJson } from "serpapi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  if (!process.env.SERPAPI_KEY) {
    console.warn("No SERPAPI_KEY found, returning mock data for demonstration.");
    return NextResponse.json({
      results: [
        {
          id: "1",
          title: "Mock: Ruby Red Lipstick",
          source: "Mock Store",
          price: "$24.00",
          thumbnail: "https://placehold.co/400x400/cc0000/ffffff.png?text=Ruby+Red",
          link: "#"
        },
        {
          id: "2",
          title: "Mock: Rose Gold Blush",
          source: "Mock Store",
          price: "$32.00",
          thumbnail: "https://placehold.co/400x400/df989b/ffffff.png?text=Rose+Gold",
          link: "#"
        },
        {
          id: "3",
          title: "Mock: Peach Glow",
          source: "Mock Store",
          price: "$28.00",
          thumbnail: "https://placehold.co/400x400/ffbba1/ffffff.png?text=Peach+Glow",
          link: "#"
        }
      ]
    });
  }

  try {
    const response = await getJson({
      engine: "google_shopping",
      q: q,
      hl: "en",
      gl: "us",
      api_key: process.env.SERPAPI_KEY,
    });
    
    const results = response.shopping_results || [];
    // We can map the output to only return necessary fields to save payload size
    const mappedResults = results.map((item: any) => ({
      id: item.product_id || item.position,
      title: item.title,
      source: item.source,
      price: item.price,
      extracted_price: item.extracted_price,
      thumbnail: item.thumbnail,
      link: item.link
    }));

    return NextResponse.json({ results: mappedResults });
  } catch (error) {
    console.error("SerpApi Fetch Error (Search):", error);
    return NextResponse.json({ error: "Failed to fetch data from SerpApi" }, { status: 500 });
  }
}
