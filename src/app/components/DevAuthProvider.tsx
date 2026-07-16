"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  DEV_USERS,
  DevRole,
  DevUser,
  nextDevRole,
  readDevRoleCookie,
  writeDevRoleCookie,
} from "@/lib/devAuth";

interface DevSessionUser extends DevUser {}

interface DevSession {
  user: DevSessionUser;
}

interface DevAuthContextValue {
  role: DevRole;
  session: DevSession | null;
  status: "loading" | "authenticated" | "unauthenticated";
  setRole: (role: DevRole) => void;
  cycleRole: () => void;
  update: () => Promise<null>;
}

const DevAuthContext = createContext<DevAuthContextValue | null>(null);

export function DevAuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<DevRole>("guest");
  // Cookie can only be read after mount — pages must wait for `ready` before
  // treating "guest" as a real answer, or they'll redirect away before the
  // real role loads (children's mount effects run before this one).
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRoleState(readDevRoleCookie());
    setReady(true);
  }, []);

  const setRole = useCallback((next: DevRole) => {
    writeDevRoleCookie(next);
    setRoleState(next);
  }, []);

  const cycleRole = useCallback(() => {
    setRoleState((prev) => {
      const next = nextDevRole(prev);
      writeDevRoleCookie(next);
      return next;
    });
  }, []);

  const session: DevSession | null = role === "guest" ? null : { user: DEV_USERS[role] };

  const value: DevAuthContextValue = {
    role,
    session,
    status: !ready ? "loading" : session ? "authenticated" : "unauthenticated",
    setRole,
    cycleRole,
    update: async () => null,
  };

  return <DevAuthContext.Provider value={value}>{children}</DevAuthContext.Provider>;
}

function useDevAuthContext(): DevAuthContextValue {
  const ctx = useContext(DevAuthContext);
  if (!ctx) throw new Error("useDevAuth/useDevSession must be used within DevAuthProvider");
  return ctx;
}

// Drop-in replacement for next-auth/react's useSession().
export function useDevSession() {
  const { session, status, update } = useDevAuthContext();
  return { data: session, status, update };
}

// Access to the role toggle itself (used by Navbar and the floating toggle button).
export function useDevAuth() {
  const { role, setRole, cycleRole } = useDevAuthContext();
  return { role, setRole, cycleRole };
}
