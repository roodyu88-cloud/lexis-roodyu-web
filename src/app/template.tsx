// Next.js remounts template.tsx (unlike layout.tsx) on every navigation,
// which is what re-triggers the CSS animation on each tab/page switch.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="rc-page-transition">{children}</div>;
}
