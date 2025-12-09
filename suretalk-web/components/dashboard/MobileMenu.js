import { motion } from "framer-motion";
import { X, Home, MessageSquare, Users, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function MobileMenu({ isOpen, onClose, type = "user" }) {
  const menuItems = type === "admin" 
    ? [
        { label: "Admin Home", href: "/admin", icon: <Home className="w-5 h-5" /> },
        { label: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
        { label: "Voice Wills", href: "/admin/wills", icon: <MessageSquare className="w-5 h-5" /> },
        { label: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
      ]
    : [
        { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
        { label: "Voice Notes", href: "/dashboard/voice-notes", icon: <MessageSquare className="w-5 h-5" /> },
        { label: "Contacts", href: "/dashboard/contacts", icon: <Users className="w-5 h-5" /> },
        { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
      ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 lg:hidden"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        exit={{ x: -280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative bg-white w-64 h-full shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-800">
                SureTalk {type === "admin" ? "Admin" : ""}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <Link key={index} href={item.href}>
                <div
                  onClick={onClose}
                  className="flex items-center px-3 py-3 rounded-lg hover:bg-gray-100 
                           text-gray-700 cursor-pointer"
                >
                  <div className="mr-3 text-gray-500">
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 border-t" />

          {/* Logout */}
          <div
            onClick={() => {
              console.log("Logout");
              onClose();
            }}
            className="flex items-center px-3 py-3 rounded-lg hover:bg-red-50 
                     text-red-600 cursor-pointer"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Log Out</span>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} SureTalk
            </p>
            <p className="text-xs text-gray-400 mt-1">
              v2.0.0
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}