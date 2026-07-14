import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: "Missing or invalid token" }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.NEXTAUTH_SECRET || "fallback_secret_key_12345";

    try {
        const decoded = jwt.verify(token, secret) as any;
        const discordId = decoded.discordId;

        if (!discordId) {
            return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { discordId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return data matching what newlx expects, plus extra flags
        return NextResponse.json({
            id: user.discordId,
            username: user.username,
            avatarUrl: user.avatar || null,
            isPremium: user.isPremium,
            premiumUntil: user.premiumUntil,
            role: user.role,
            badges: JSON.parse(user.badges || "[]")
        });

    } catch (e) {
        return NextResponse.json({ error: "Token verification failed" }, { status: 401 });
    }
}
