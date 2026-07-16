import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ─── Discord Webhook helper ────────────────────────────────────────────────────
async function notifyDiscord(preset: {
  id: string;
  name: string;
  description: string | null;
  author: string;
  isVerified: boolean;
}, server: { name: string; iconUrl: string; webhookUrl: string; discordRoleId: string | null }) {
  const presetUrl = `${process.env.NEXTAUTH_URL ?? "https://лексис.xyz"}/presets/${preset.id}`;

  const roleMention = server.discordRoleId ? `<@&${server.discordRoleId}> ` : "";

  const embed: any = {
    title: `📦 ${preset.name}`,
    description: (preset.description
      ? preset.description.slice(0, 300) + "\n\n"
      : "Новый пресет без описания.\n\n") + `**[Скачать пресет](${presetUrl})**`,
    url: presetUrl,
    color: 0x5865f2,
    fields: [
      { name: "🎮 Сервер", value: server.name, inline: true },
      { name: "👤 Автор", value: preset.author, inline: true },
    ],
    footer: { text: "Lexis Web • Пресеты" },
    timestamp: new Date().toISOString(),
  };

  if (server.iconUrl && server.iconUrl.startsWith("http")) {
    embed.thumbnail = { url: server.iconUrl };
  }

  const body = {
    content: roleMention ? `${roleMention}Новый пресет для **${server.name}**!` : undefined,
    embeds: [embed],
  };

  try {
    const res = await fetch(server.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      console.error("[Webhook] Discord API error:", res.status, await res.text());
    }
  } catch (e) {
    console.error("[Webhook] Failed to send Discord notification:", e);
  }
}

// ─── POST /api/upload ──────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, data, serverProjectId, serverId } = body;

    if (!name || !data) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const author = session?.user?.name || "Аноним";
    const discordId = (session?.user as any)?.id || null;

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if ((session.user as any).canUpload === false) {
      return new NextResponse("У вас заблокирован доступ к загрузке пресетов модератором", { status: 403 });
    }

    const preset = await prisma.preset.create({
      data: {
        name,
        description: description || null,
        data,
        author,
        discordId,
        serverProjectId: serverProjectId || null,
        serverId: serverId || null
      }
    });

    // ── Discord webhook notification ──────────────────────────────────────────
    if (serverProjectId) {
      const serverProject = await prisma.serverProject.findUnique({
        where: { id: serverProjectId }
      });
      let serverName = serverProject?.name || "Неизвестный сервер";
      if (serverId) {
        const server = await prisma.server.findUnique({ where: { id: serverId } });
        if (server) serverName = `${serverProject?.name} / ${server.name}`;
      }
      if (serverProject?.webhookUrl) {
        await notifyDiscord(
          { ...preset, description: preset.description ?? null },
          {
            name: serverName,
            iconUrl: serverProject.iconUrl,
            webhookUrl: serverProject.webhookUrl,
            discordRoleId: serverProject.discordRoleId ?? null,
          }
        );
      }
    }

    return NextResponse.json({ id: preset.id });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
