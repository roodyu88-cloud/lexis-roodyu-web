import EditReleasePageClient from "./EditReleasePageClient";

export function generateStaticParams() {
  return [
    { id: "ph-release-1" },
    { id: "ph-release-2" },
  ];
}

export default function EditReleasePage({ params }: { params: { id: string } }) {
  return <EditReleasePageClient id={params.id} />;
}
