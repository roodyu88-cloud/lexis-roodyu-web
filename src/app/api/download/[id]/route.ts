import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const preset = await prisma.preset.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!preset) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Increment downloads async
  prisma.preset.update({
    where: { id: preset.id },
    data: { downloads: { increment: 1 } }
  }).catch(console.error);

  let rawData;
  try {
    rawData = JSON.parse(preset.data);
  } catch(e) {
    rawData = [];
  }

  // Wrap in our standard format
  const output = {
    profile_name: preset.name,
    author: preset.author,
    data: Array.isArray(rawData) ? rawData : (rawData.data || [])
  };

  return new NextResponse(JSON.stringify(output, null, 4), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(preset.name)}.json"`
    }
  });
}
