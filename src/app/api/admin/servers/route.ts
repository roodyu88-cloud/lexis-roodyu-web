import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const discordId = (session.user as any).id;
  const role = (session.user as any).role;
  if (role === "admin" || role === "developer" || role === "moderator" || discordId === "546005790864048140") {
    return session;
  }
  return null;
}

export async function GET() {
  try {
    const servers = await prisma.serverProject.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ servers });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch servers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action, id, name, projectName, iconBase64 } = body;

    if (action === "create" || action === "update") {
      if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
      
      const { discordRoleId, webhookUrl } = body;
      let iconUrl = undefined;
      
      if (iconBase64) {
        // Сохраняем картинку напрямую в формате Base64, чтобы избежать проблем
        // с кэшированием папки public и путями на сервере.
        iconUrl = iconBase64;
      }

      if (action === "create") {
        if (!iconUrl) return NextResponse.json({ error: "Icon is required for creation" }, { status: 400 });
        const server = await prisma.serverProject.create({
          data: {
            name,
            projectName: projectName || null,
            iconUrl,
            discordRoleId: discordRoleId || null,
            webhookUrl: webhookUrl || null,
          }
        });
        return NextResponse.json({ server });
      } else {
        // update
        const dataToUpdate: any = {
          name,
          projectName: projectName !== undefined ? (projectName || null) : undefined,
          discordRoleId: discordRoleId !== undefined ? (discordRoleId || null) : undefined,
          webhookUrl: webhookUrl !== undefined ? (webhookUrl || null) : undefined,
        };
        if (iconUrl) dataToUpdate.iconUrl = iconUrl;
        
        const server = await prisma.serverProject.update({
          where: { id },
          data: dataToUpdate
        });
        return NextResponse.json({ server });
      }
    } else if (action === "delete") {
      if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
      await prisma.serverProject.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
