import { Suspense } from "react";
import ContactsClient from "./ContactsClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading contacts...</div>}>
      <ContactsClient />
    </Suspense>
  );
}
