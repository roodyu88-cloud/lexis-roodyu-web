import EditPresetPageClient from "./EditPresetPageClient";

export function generateStaticParams() {
  return [
    { id: "ph-preset-1" },
    { id: "ph-preset-2" },
    { id: "ph-preset-3" },
  ];
}

export default function EditPresetPage({ params }: { params: { id: string } }) {
  return <EditPresetPageClient id={params.id} />;
}
