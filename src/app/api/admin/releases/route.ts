import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

async function sendDiscordWebhook(webhookUrl: string, release: any) {
  const downloadUrlForWebhook = `${process.env.NEXTAUTH_URL || "https://лексис.xyz"}/api/releases/download/${release.id}`;
  
  const header = `# Lexis ${release.version}\n## ${release.title}\n**Что нового добавленно:**\n\`\`\`\n`;
  const footer = `\n\`\`\`\n\n**[📥 СКАЧАТЬ ОБНОВЛЕНИЕ](${downloadUrlForWebhook})**` + 
                 (release.virusTotalUrl ? `\n**[🛡️ Проверка VirusTotal](${release.virusTotalUrl})**` : "");
  
  const desc = release.description || "Нет описания";
  const fullMessage = header + desc + footer;
  
  if (fullMessage.length <= 2000) {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: fullMessage })
    });
  } else {
    // Split into chunks if too large
    const chunkSize = 1800;
    const chunks = [];
    for (let i = 0; i < desc.length; i += chunkSize) {
      chunks.push(desc.substring(i, i + chunkSize));
    }
    
    for (let i = 0; i < chunks.length; i++) {
      let content = "";
      if (i === 0) {
        content = header + chunks[i] + "\n```";
      } else if (i === chunks.length - 1) {
        content = "```\n" + chunks[i] + footer;
      } else {
        content = "```\n" + chunks[i] + "\n```";
      }
      
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      // Small delay to avoid rate limit
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const { version, title, description, downloadUrl, fileData, fileName, virusTotalUrl } = body;

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
        virusTotalUrl: virusTotalUrl || null,
      },
    });

    try {
      const webhookSetting = await prisma.appSetting.findUnique({
        where: { key: "RELEASES_WEBHOOK_URL" }
      });
      
      if (webhookSetting && webhookSetting.value) {
        await sendDiscordWebhook(webhookSetting.value, release);
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
    if (!session || ((session.user as any)?.role !== "admin" && (session.user as any)?.role !== "developer")) {
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

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any)?.role !== "admin" && (session.user as any)?.role !== "developer")) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const { id, version, title, description, downloadUrl, virusTotalUrl } = body;

    if (!id || !version || !title) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const release = await prisma.release.update({
      where: { id },
      data: {
        version,
        title,
        description: description || "",
        downloadUrl: downloadUrl || null,
        virusTotalUrl: virusTotalUrl || null,
      },
    });

    try {
      const webhookSetting = await prisma.appSetting.findUnique({
        where: { key: "RELEASES_WEBHOOK_URL" }
      });
      
      if (webhookSetting && webhookSetting.value) {
        await sendDiscordWebhook(webhookSetting.value, release);
      }
    } catch (webhookError) {
      console.error("Failed to send release webhook on update:", webhookError);
    }

    return NextResponse.json(release);
  } catch (error) {
    console.error("Error updating release:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
