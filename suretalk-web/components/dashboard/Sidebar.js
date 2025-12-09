import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  Home, 
  MessageSquare, 
  Users, 
  Shield, 
  Settings,
  BarChart3,
  Bell,
  FileText,
  Calendar,
  HelpCircle,
  LogOut,
  Mic,
  Archive,
  Clock
} from "lucide-react";

export default function Sidebar({ type, onClose }) {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState(router.pathname);

  const userMenu = [
    { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { label: "Voice Notes", href: "/dashboard/voice-notes", icon: <Mic className="w-5 h-5" /> },
    { label: "Contacts", href: "/dashboard/contacts", icon: <Users className="w-5 h-5" /> },
    { label: "Legacy Vault", href: "/dashboard/vault", icon: <Archive className="w-5 h-5" /> },
    { label: "Scheduled Messages", href: "/dashboard/scheduled", icon: <Clock className="w-5 h-5" /> },
    { label: "Notifications", href: "/dashboard/notifications", icon: <Bell className="w-5 h-5" /> },
    { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const adminMenu = [
    { label: "Admin Home", href: "/admin", icon: <Home className="w-5 h-5" /> },
    { label: "User Management", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
    { label: "Voice Wills", href: "/admin/wills", icon: <FileText className="w-5 h-5" /> },
    { label: "Scheduled Messages", href: "/admin/messages", icon: <Calendar className="w-5 h-5" /> },
    { label: "System Logs", href: "/admin/logs", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Platform Metrics", href: "/admin/metrics", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Support Tickets", href: "/admin/support", icon: <HelpCircle className="w-5 h-5" /> },
    { label: "Admin Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const menu = type === "admin" ? adminMenu : userMenu;

  const handleItemClick = (href) => {
    setActiveItem(href);
    if (onClose) onClose();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 
                        rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              SureTalk {type === "admin" && "Admin"}
            </h1>
            <p className="text-xs text-gray-500">
              {type === "admin" ? "Control Center" : "Voice Messaging"}
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
      {type === "user" && (
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
              <span className="text-brand-600 font-bold">JD</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">John Doe</h3>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 
                               rounded-full text-xs font-medium">
                  Essential
                </span>
                <span className="text-xs text-gray-500">Plan</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menu.map((item, index) => (
            <Link key={index} href={item.href}>
              <div
                onClick={() => handleItemClick(item.href)}
                className={`sidebar-item ${
                  activeItem === item.href ? "active" : ""
                }`}
              >
                <div className="mr-3 opacity-70">
                  {item.icon}
                </div>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-accent-100 text-accent-800 
                                 text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats (Admin Only) */}
        {type === "admin" && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Quick Stats
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Users</span>
                <span className="font-semibold">1,247</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Premium Users</span>
                <span className="font-semibold">312</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Storage Used</span>
                <span className="font-semibold">128 GB</span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="space-y-2">
          {type === "user" && (
            <div className="sidebar-item">
              <HelpCircle className="w-5 h-5 mr-3 opacity-70" />
              <span>Help & Support</span>
            </div>
          )}
          
          <div 
            className="sidebar-item text-accent-600 hover:text-accent-700"
            onClick={() => {
              // Handle logout
              console.log("Logout clicked");
            }}
          >
            <LogOut className="w-5 h-5 mr-3 opacity-70" />
            <span>Log Out</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} SureTalk
            <br />
            v2.0.0
          </p>
        </div>
      </div>
    </div>
  );
}