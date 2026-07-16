"use client";

import { DevAuthProvider } from "./DevAuthProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <DevAuthProvider>{children}</DevAuthProvider>;
}
