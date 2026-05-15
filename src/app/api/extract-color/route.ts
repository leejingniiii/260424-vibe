import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "이미지 URL이 없습니다" }, { status: 400 });
    }

    let buffer: Buffer;

    if (imageUrl.startsWith("data:image/")) {
      const matches = imageUrl.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: "잘못된 이미지 데이터 형식입니다." }, { status: 400 });
      }
      buffer = Buffer.from(matches[2], "base64");
      buffer = await sharp(buffer).jpeg().toBuffer();
    } else {
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
        }
      });
      if (!response.ok) {
        return NextResponse.json({ error: "원격 이미지 가져오기 실패" }, { status: 400 });
      }

      const arrayBuffer = await response.arrayBuffer();
      // Convert to strictly JPEG format using sharp to avoid WebP/PNG parsing errors in ColorThief
      buffer = await sharp(Buffer.from(arrayBuffer)).jpeg().toBuffer();
    }

    // Extract dominant color directly using sharp
    const { dominant } = await sharp(buffer).stats();
    
    if (!dominant || dominant.r === undefined) {
      return NextResponse.json({ error: "Could not extract dominant color" }, { status: 500 });
    }

    const color = [dominant.r, dominant.g, dominant.b];
    const hex = rgbToHex(color[0], color[1], color[2]);

    return NextResponse.json({ hex, rgb: color });
  } catch (error) {
    console.error("Extract Color Error:", error);
    return NextResponse.json({ error: `Extraction processing failed: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
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
