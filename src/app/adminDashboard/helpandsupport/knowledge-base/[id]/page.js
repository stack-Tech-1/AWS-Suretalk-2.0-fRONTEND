import { Suspense } from "react";
import AdminKnowledgeBaseClient from "./AdminKnowledgeBaseClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading article editor…</div>}>
      <AdminKnowledgeBaseClient />
    </Suspense>
  );
}