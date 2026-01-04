import { Suspense } from "react";
import HelpAndSupportClient from "./HelpAndSupportClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading help & support...</div>}>
      <HelpAndSupportClient />
    </Suspense>
  );
}