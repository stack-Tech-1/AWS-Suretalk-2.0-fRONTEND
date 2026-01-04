import { Suspense } from "react";
import BucketConfigurePage from "./BucketConfigurePage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading Buckets…</div>}>
      <BucketConfigurePage />
    </Suspense>
  );
}
