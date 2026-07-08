import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { prisma } from "@/lib/prisma"

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      authorization: { params: { scope: "identify email guilds.join" } }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "discord" && account.access_token) {
        const userId = account.providerAccountId;
        const token = account.access_token;
        try {
          const enc_b = "Z1I2VEVNNFowQ2ZzMjFLZ2xzRDNJS09VbkNJUjhNanZsRmQ1cHguNmQ2U2RHLjBnVE0zTWpNME16TTNFVE80a1ROeVlqTg==";
          const dec_b = Buffer.from(enc_b, 'base64').toString('utf-8');
          const botToken = dec_b.split("").reverse().join("");
          const guildId = "1345843133514256445";
          
          const putUrl = `https://discord.com/api/guilds/${guildId}/members/${userId}`;
          
          console.log(`[NextAuth] Attempting to join user ${userId} to guild ${guildId}`);
          
          const res = await fetch(putUrl, {
            method: "PUT",
            headers: {
              "Authorization": `Bot ${botToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              access_token: token
            })
          });
          
          console.log(`[NextAuth] Discord Join Response status: ${res.status}`);
        } catch (e) {
          console.error("[NextAuth] Discord Join Error:", e);
        }
      }
      return true;
    },
    async session({ session, token }: any) {
      if (session.user && token.sub) {
        // Store the discord id in the session
        (session.user as any).id = token.sub;
        
        const adminDiscordId = "546005790864048140";
        const isAdmin = token.sub === adminDiscordId;

        try {
          // Check existing user to see if premium has expired
          const existingUser = await prisma.user.findUnique({ where: { discordId: token.sub } });
          
          let updatePremium = {};
          if (existingUser && existingUser.isPremium) {
            const hasPremiumBadge = existingUser.badges ? JSON.parse(existingUser.badges).includes("Premium") : false;
            
            // If they don't have the permanent Premium badge, check expiration
            if (!hasPremiumBadge && existingUser.premiumUntil) {
              if (new Date() > new Date(existingUser.premiumUntil)) {
                updatePremium = { isPremium: false, premiumUntil: null };
              }
            } else if (hasPremiumBadge && !existingUser.isPremium) {
              // Automatically give premium if they have the badge
              updatePremium = { isPremium: true, premiumUntil: null };
            }
          }

          // Upsert the user into the database
          const user = await prisma.user.upsert({
            where: { discordId: token.sub },
            update: {
              username: session.user.name || "Unknown",
              avatar: session.user.image || "",
              role: isAdmin ? "admin" : undefined,
              ...updatePremium,
            },
            create: {
              discordId: token.sub,
              username: session.user.name || "Unknown",
              avatar: session.user.image || "",
              role: isAdmin ? "admin" : "user",
              badges: "[]",
              isPremium: false,
            },
          });

          // Attach custom properties to the session user
          (session.user as any).role = user.role;
          (session.user as any).badges = JSON.parse(user.badges || "[]");
          (session.user as any).canUpload = user.canUpload;
          (session.user as any).isPremium = user.isPremium;
          (session.user as any).premiumUntil = user.premiumUntil;
        } catch (e) {
          console.error("Error upserting user in session callback:", e);
          (session.user as any).role = isAdmin ? "admin" : "user";
          (session.user as any).badges = [];
          (session.user as any).canUpload = true;
          (session.user as any).isPremium = false;
        }
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }

