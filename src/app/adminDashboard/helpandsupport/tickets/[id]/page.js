import { Suspense } from "react";
import AdminTicketDetail from "./AdminTicketDetail";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading Ticket detail…</div>}>
      <AdminTicketDetail />
    </Suspense>
  );
}