import TakeExamGate from "./TakeExamGate";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

export default function TakeExamPage({ params }: { params: { id: string } }) {
  return <TakeExamGate id={params.id} />;
}
