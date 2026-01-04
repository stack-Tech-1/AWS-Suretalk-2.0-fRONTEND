import { Suspense } from "react";
import UserTicketDetail from "./UserTicketDetail";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading User Tickets…</div>}>
      <UserTicketDetail />
    </Suspense>
  );
}
