// Client-side mock authentication for the static/GitHub-Pages debug build.
// No server, no real Discord OAuth — role is a cookie the toggle button writes,
// and every page reads it client-side instead of calling next-auth's getServerSession.

export type DevRole = "guest" | "user" | "admin";

export const DEV_ROLE_COOKIE = "lexis_dev_role";

export interface DevUser {
  id: string;
  name: string;
  image: string;
  role: string;
  isPremium: boolean;
  premiumUntil: string | null;
  badges: string[];
}

export const DEV_USERS: Record<Exclude<DevRole, "guest">, DevUser> = {
  user: {
    id: "111111111111111111",
    name: "roodyu",
    image: "/img/Verified.png",
    role: "user",
    isPremium: true,
    premiumUntil: null,
    badges: ["Creator", "Staff"],
  },
  admin: {
    id: "546005790864048140",
    name: "Admin",
    image: "/img/Verified.png",
    role: "admin",
    isPremium: true,
    premiumUntil: null,
    badges: ["Creator", "Staff"],
  },
};

export const DEV_ROLE_LABELS: Record<DevRole, string> = {
  guest: "Гость",
  user: "Пользователь",
  admin: "Админ",
};

export function readDevRoleCookie(): DevRole {
  if (typeof document === "undefined") return "guest";
  const match = document.cookie.match(new RegExp(`(?:^|; )${DEV_ROLE_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : "";
  return value === "user" || value === "admin" ? value : "guest";
}

export function writeDevRoleCookie(role: DevRole) {
  if (typeof document === "undefined") return;
  document.cookie = `${DEV_ROLE_COOKIE}=${role}; path=/; max-age=31536000; SameSite=Lax`;
}

export function nextDevRole(role: DevRole): DevRole {
  if (role === "guest") return "user";
  if (role === "user") return "admin";
  return "guest";
}
