import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const release = await prisma.release.findUnique({
      where: { id },
    });

    if (!release) {
      return new NextResponse("Release not found", { status: 404 });
    }

    if (release.fileData) {
      // It's an uploaded file
      const buffer = Buffer.from(release.fileData, "base64");
      
      const response = new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${release.fileName || 'Lexis_Update.zip'}"`,
        },
      });
      return response;
    } else if (release.downloadUrl) {
      // Fallback to URL if fileData is not present
      return NextResponse.redirect(release.downloadUrl);
    } else {
      return new NextResponse("No file or URL found for this release", { status: 404 });
    }
  } catch (error) {
    console.error("Error downloading release:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
