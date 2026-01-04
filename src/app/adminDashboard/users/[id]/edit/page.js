import { Suspense } from "react";
import EditUser from "./EditUser";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading user…</div>}>
      <EditUser />
    </Suspense>
  );
}
