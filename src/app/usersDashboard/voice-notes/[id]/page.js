import { Suspense } from "react";
import VoiceNoteDetail from "./VoiceNoteDetail";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading Voice details…</div>}>
      <VoiceNoteDetail />
    </Suspense>
  );
}
