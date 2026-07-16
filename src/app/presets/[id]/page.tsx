import PresetDetailsClient from "./PresetDetailsClient";

// Static export needs a finite param list at build time — these match the
// PLACEHOLDER_PRESETS ids in ../page.tsx. Any other id 404s under static hosting.
export function generateStaticParams() {
  return [
    { id: "ph-preset-1" },
    { id: "ph-preset-2" },
    { id: "ph-preset-3" },
  ];
}

export default function PresetDetails({ params }: { params: { id: string } }) {
  return <PresetDetailsClient id={params.id} />;
}
