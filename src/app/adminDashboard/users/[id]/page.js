import { Suspense } from "react";
import UserDetail from "./UserDetail";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading User…</div>}>
      <UserDetail />
    </Suspense>
  );
}
