import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
        // If the user is not authenticated on the website, redirect them to the login page,
        // and specify a callback URL to return to this endpoint after login.
        const url = new URL(req.url);
        const loginUrl = new URL('/login', url.origin);
        loginUrl.searchParams.set('callbackUrl', '/api/desktop/auth');
        return NextResponse.redirect(loginUrl);
    }

    const discordId = (session.user as any).id;
    const secret = process.env.NEXTAUTH_SECRET || "fallback_secret_key_12345";
    
    // Create a JWT token for the desktop app
    const token = jwt.sign(
        { discordId },
        secret,
        { expiresIn: '30d' }
    );

    // Redirect to the desktop app custom protocol
    return NextResponse.redirect(`lexis://auth?token=${token}`);
}
