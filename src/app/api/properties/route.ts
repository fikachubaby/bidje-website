import { NextResponse } from "next/server";
import { searchProperties } from "@/lib/properties";
import type { PropertyCategory } from "@/types/property";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const location = searchParams.get("location") ?? undefined;
  const category = searchParams.get("category") as PropertyCategory | null;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const properties = await searchProperties({
    location,
    category: category ?? undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });

  return NextResponse.json(properties);
}
