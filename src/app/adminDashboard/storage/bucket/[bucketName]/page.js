import { Suspense } from "react";
import BucketDetailPage from "./BucketDetailPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading Bucket Details…</div>}>
      <BucketDetailPage />
    </Suspense>
  );
}
