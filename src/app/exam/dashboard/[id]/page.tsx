import ExamDashboardGate from "./ExamDashboardGate";

// Exam sessions are created at runtime via /api/exam/generate, which doesn't
// function under static hosting anyway — this placeholder id is just so the
// route has a valid static page to demonstrate the gate.
export function generateStaticParams() {
  return [{ id: "demo" }];
}

export default function ExamDashboardPage({ params }: { params: { id: string } }) {
  return <ExamDashboardGate id={params.id} />;
}
