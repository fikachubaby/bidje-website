import { NextResponse } from "next/server";
import { searchProperties, getPropertyById } from "@/lib/properties/properties";
import type { PropertyCategory } from "@/types/property";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;

  // Case 1: GET /api/properties/[id]
  if (slug && slug.length === 1) {
    const id = slug[0];
    const property = await getPropertyById(id);

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  }

  // Case 2: GET /api/properties (Search / Filter List)
  if (!slug || slug.length === 0) {
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

  // Unknown subpath under /api/properties/*
  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}