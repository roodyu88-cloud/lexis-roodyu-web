import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const currentUserId = (session.user as any).id;
  const currentUserRole = (session.user as any).role || "user";
  const isModOrAdmin = currentUserRole === "admin" || currentUserRole === "developer" || currentUserRole === "moderator" || currentUserId === "546005790864048140";

  try {
    const preset = await prisma.preset.findUnique({
      where: { id },
    });

    if (!preset) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    const isAuthor = preset.discordId === currentUserId;

    if (!isAuthor && !isModOrAdmin) {
      return NextResponse.json({ error: "Forbidden: You are not authorized to delete this preset" }, { status: 403 });
    }

    // If deleting someone else's preset, check for a reason
    if (!isAuthor && isModOrAdmin) {
      let body;
      try {
        body = await req.json();
      } catch (e) {
        body = {};
      }
      const { reason } = body;

      if (!reason || reason.trim() === "") {
        return NextResponse.json({ error: "Укажите причину удаления" }, { status: 400 });
      }

      // Create a notification for the author if they have a discordId
      if (preset.discordId) {
        await prisma.notification.create({
          data: {
            discordId: preset.discordId,
            message: `Ваш пресет "${preset.name}" был удален модератором ${session.user.name || "Staff"} по причине: ${reason}`,
          },
        });
      }
    }

    // Delete the preset
    await prisma.preset.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Preset deleted successfully" });
  } catch (e) {
    console.error("Error deleting preset:", e);
    return NextResponse.json({ error: "Failed to delete preset" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const currentUserId = (session.user as any).id;
  const currentUserRole = (session.user as any).role || "user";
  const isModOrAdmin = currentUserRole === "admin" || currentUserRole === "developer" || currentUserRole === "moderator" || currentUserId === "546005790864048140";

  try {
    const preset = await prisma.preset.findUnique({
      where: { id },
    });

    if (!preset) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    const isAuthor = preset.discordId === currentUserId;

    if (!isAuthor && !isModOrAdmin) {
      return NextResponse.json({ error: "Forbidden: You are not authorized to edit this preset" }, { status: 403 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { name, description, serverProjectId, serverId } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Название пресета обязательно" }, { status: 400 });
    }

    const updatedPreset = await prisma.preset.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        serverProjectId: serverProjectId || null,
        serverId: serverId || null,
      },
    });

    return NextResponse.json({ success: true, preset: updatedPreset });
  } catch (e) {
    console.error("Error updating preset:", e);
    return NextResponse.json({ error: "Failed to update preset" }, { status: 500 });
  }
}
