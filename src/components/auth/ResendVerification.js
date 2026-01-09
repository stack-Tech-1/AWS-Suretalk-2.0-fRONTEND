"use client";
import { useState } from "react";
import { api } from "../../utils/api";

export default function ResendVerification({ email }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    if (!email) {
      alert("Email is required");
      return;
    }

    setLoading(true);
    try {
      await api.resendVerification({ email });
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      alert("Failed to resend: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-800 mb-2">
        {sent ? (
          <>✅ Verification email sent! Check your inbox.</>
        ) : (
          <>📧 Need a new verification link?</>
        )}
      </p>
      <button
        onClick={handleResend}
        disabled={loading || sent}
        className="text-sm text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
      >
        {loading ? "Sending..." : sent ? "Sent!" : "Resend Verification Email"}
      </button>
    </div>
  );
}