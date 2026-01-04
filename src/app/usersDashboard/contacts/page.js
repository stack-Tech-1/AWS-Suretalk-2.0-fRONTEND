// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\src\app\usersDashboard\contacts\page.js
"use client";
import { Suspense } from "react";
import ContactsContent from "./ContactsContent";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contacts...</p>
        </div>
      </div>
    }>
      <ContactsContent />
    </Suspense>
  );
}