import { Suspense } from "react";
import EditScheduledMessage from "./EditScheduledMessage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading Messages…</div>}>
      <EditScheduledMessage />
    </Suspense>
  );
}
