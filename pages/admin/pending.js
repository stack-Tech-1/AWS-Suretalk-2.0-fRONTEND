"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, LogOut } from "lucide-react";
import { api } from "../../utils/api";

export default function AdminPending() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await api.getCurrentUser(); // 🔑 must exist in backend
        const user = res?.data?.user;

        if (!user || !user.is_admin) {
          router.replace("/admin/login");
          return;
        }

        if (user.admin_status === "approved") {
          router.replace("/admin/dashboard");
          return;
        }

        if (user.admin_status !== "pending") {
          throw new Error("Admin access not approved");
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Unable to verify admin status");
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error(e);
    } finally {
      router.replace("/admin/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-300">
        Checking admin status...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700 shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
            <Clock className="w-10 h-10 text-yellow-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Approval Pending
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Your admin access request has been received and is currently under review.
        </p>

        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 mt-1" />
            <div className="text-sm text-gray-300">
              Once approved, you will automatically gain access to the admin dashboard.
              Please check back later.
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 bg-gray-900 hover:bg-gray-800 transition rounded-xl border border-gray-700 text-gray-300 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          © {new Date().getFullYear()} SureTalk Systems
        </p>
      </motion.div>
    </div>
  );
}
