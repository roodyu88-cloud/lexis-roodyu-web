import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const { version, title, description, downloadUrl, fileData, fileName } = body;

    if (!version || !title) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (!downloadUrl && !fileData) {
      return new NextResponse("You must provide a file or a download URL", { status: 400 });
    }

    const release = await prisma.release.create({
      data: {
        version,
        title,
        description: description || "",
        downloadUrl: downloadUrl || null,
        fileData: fileData || null,
        fileName: fileName || null,
      },
    });

    try {
      const webhookSetting = await prisma.appSetting.findUnique({
        where: { key: "RELEASES_WEBHOOK_URL" }
      });
      
      if (webhookSetting && webhookSetting.value) {
        const downloadUrlForWebhook = `${process.env.NEXTAUTH_URL || "https://лексис.xyz"}/api/releases/download/${release.id}`;
        
        const messageContent = `# Lexis ${version}\n## ${title}\n**Что нового добавленно:**\n\`\`\`\n${description || "Нет описания"}\n\`\`\`\n\n**[📥 СКАЧАТЬ ОБНОВЛЕНИЕ](${downloadUrlForWebhook})**`;
        
        await fetch(webhookSetting.value, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: messageContent
          })
        });
      }
    } catch (webhookError) {
      console.error("Failed to send release webhook:", webhookError);
    }

    return NextResponse.json(release);
  } catch (error) {
    console.error("Error creating release:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Release ID missing", { status: 400 });
    }

    await prisma.release.delete({
      where: { id },
    });

    return new NextResponse("Deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting release:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
