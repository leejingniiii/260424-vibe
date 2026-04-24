import { NextResponse } from "next/server";
import { getColor } from "colorthief";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "이미지 URL이 없습니다" }, { status: 400 });
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      return NextResponse.json({ error: "원격 이미지 가져오기 실패" }, { status: 400 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a temporary file
    const tempDir = os.tmpdir();
    // Getting extension is tricky from URL, assume jpg as it's the most robust for pure pixel reading
    const tempFilePath = path.join(tempDir, `img-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`);
    fs.writeFileSync(tempFilePath, buffer);

    // Extract dominant color. 
    // color is returning [r, g, b] array.
    const color = await getColor(tempFilePath);

    // Cleanup
    fs.unlinkSync(tempFilePath);

    if (!color) {
      return NextResponse.json({ error: "Could not extract color" }, { status: 500 });
    }

    const hex = rgbToHex(color[0], color[1], color[2]);

    return NextResponse.json({ hex, rgb: color });
  } catch (error) {
    console.error("Extract Color Error:", error);
    return NextResponse.json({ error: "Extraction processing failed" }, { status: 500 });
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
