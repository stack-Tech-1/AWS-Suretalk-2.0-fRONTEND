// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\components\dashboard\Sidebar.js
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  Home, 
  MessageSquare, 
  Users, 
  Shield, 
  Settings, 
  Bell, 
  BarChart3,
  FileText,
  Calendar,
  Archive,
  Download,
  Upload,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Mic,
  Clock,
  UserCheck,
  X,
  FileAudio,
  Contact,
  ClipboardList
} from "lucide-react";

export default function Sidebar({ 
  type, 
  isOpen, 
  collapsed, 
  onCollapse, 
  onClose 
}) {
  const router = useRouter();

  // User menu items
  const userMenu = [
    { icon: <Home className="w-5 h-5" />, label: "Dashboard", href: "/usersDashboard", count: null },
    { icon: <Mic className="w-5 h-5" />, label: "Voice Notes", href: "/usersDashboard/voice-notes", count: 12 },
    { icon: <Users className="w-5 h-5" />, label: "Contacts", href: "/usersDashboard/contacts", count: 5 },
    { icon: <Shield className="w-5 h-5" />, label: "Legacy Vault", href: "/usersDashboard/vault", count: 3 },
    { icon: <Calendar className="w-5 h-5" />, label: "Scheduled", href: "/usersDashboard/scheduled", count: 2 },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/usersDashboard/settings", count: null },
  ];

  // Admin menu items
  const adminMenu = [
    { icon: <BarChart3 className="w-5 h-5" />, label: "Overview", href: "/adminDashboard", count: null },
    { icon: <Users className="w-5 h-5" />, label: "Users", href: "/adminDashboard/users", count: 45 },
    { icon: <MessageSquare className="w-5 h-5" />, label: "Voice Wills", href: "/adminDashboard/wills", count: 8 },
    { icon: <Clock className="w-5 h-5" />, label: "Scheduled", href: "/adminDashboard/messages", count: 12 },
    { icon: <FileText className="w-5 h-5" />, label: "System Logs", href: "/adminDashboard/logs", count: null },
    { icon: <Archive className="w-5 h-5" />, label: "Storage", href: "/adminDashboard/storage", count: null },
    { icon: <ClipboardList className="w-5 h-5" />, label: "Admin requests", href: "/adminDashboard/admin-requests", count: 4 },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/adminDashboard/settings", count: null },
  ];

  const menu = type === "admin" ? adminMenu : userMenu;

  const NavItem = ({ item }) => {
    const isActive = router.pathname === item.href;
    
    return (
      <Link href={item.href}>
        <div 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer
            ${isActive 
              ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-lg' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:pl-5'
            }`}
          onClick={onClose}
        >
          <div className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-brand-500'}`}>
            {item.icon}
          </div>
          {!collapsed && (
            <>
              <span className="font-medium flex-1">{item.label}</span>
              {item.count !== null && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {item.count}
                </span>
              )}
            </>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className={`h-full flex flex-col ${collapsed ? 'items-center' : ''}`}>
      {/* Header */}
      <div className={`p-6 border-b border-gray-200 dark:border-gray-800 ${collapsed ? 'px-4' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
                  SureTalk
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {type === "admin" ? "Admin Console" : "User Dashboard"}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
          )}
          
          {/* Collapse button - desktop only */}
          {!collapsed && (
            <button 
              onClick={onCollapse}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          
          {collapsed && (
            <button 
              onClick={onCollapse}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          
          {/* Close button - mobile only */}
          <button 
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 
                     hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* User info - only when not collapsed */}
        {!collapsed && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-brand-50 to-accent-50 dark:from-brand-900/20 dark:to-accent-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <span className="font-bold text-white text-sm">JD</span>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">John Doe</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {type === "admin" ? "Administrator" : "Premium User"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 p-4 space-y-2 overflow-y-auto ${collapsed ? 'px-2' : ''}`}>
        {menu.map((item, index) => (
          <NavItem key={index} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-gray-200 dark:border-gray-800 ${collapsed ? 'px-2' : ''}`}>
        <div className="space-y-3">
          {/* Help */}
          <Link href="/help">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer
                         ${collapsed ? 'justify-center px-3' : ''}`}>
              <HelpCircle className="w-5 h-5" />
              {!collapsed && <span className="font-medium">Help & Support</span>}
            </div>
          </Link>

          {/* Logout */}
          <button 
            onClick={() => router.push("/")} // This sends the user to the home page
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 
                        hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
                        ${collapsed ? 'justify-center px-3' : ''}`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
          
          {/* Version info - only when not collapsed */}
          {!collapsed && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                v2.0.0 • {type === "admin" ? "Admin" : "User"} Mode
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}