import { Suspense } from "react";
import ScheduledMessageDetail from "./ScheduledMessageDetail";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading  details…</div>}>
      <ScheduledMessageDetail />
    </Suspense>
  );
}
