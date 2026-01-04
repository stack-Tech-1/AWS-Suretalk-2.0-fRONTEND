import { Suspense } from "react";
import UserArticleDetail from "./UserArticleDetail";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading User Article…</div>}>
      <UserArticleDetail />
    </Suspense>
  );
}
