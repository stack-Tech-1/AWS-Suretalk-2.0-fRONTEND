// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\components\dashboard\Topbar.js
import { useState, useEffect } from "react";
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Moon, 
  Sun, 
  Menu, 
  User,
  Settings,
  CreditCard,
  Zap,
  Globe,
  ChevronDown,
  LogOut
} from "lucide-react";

export default function Topbar({ type, onMenuClick }) {
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const notifications = [
    { id: 1, text: "New voice note recorded", time: "2 min ago", read: false },
    { id: 2, text: "Contact limit reached", time: "1 hour ago", read: true },
    { id: 3, text: "Legacy Vault backup complete", time: "3 hours ago", read: false },
    { id: 4, text: "Subscription renewal in 7 days", time: "1 day ago", read: true },
  ];

  const userMenuItems = type === "admin" ? [
    { icon: <User className="w-4 h-4" />, label: "Admin Profile", href: "/admin/profile" },
    { icon: <Settings className="w-4 h-4" />, label: "System Settings", href: "/admin/settings" },
    { icon: <Globe className="w-4 h-4" />, label: "Logs", href: "/admin/logs" },
    { icon: <LogOut className="w-4 h-4" />, label: "Logout", href: "/" },
  ] : [
    { icon: <User className="w-4 h-4" />, label: "Profile", href: "/profile" },
    { icon: <Settings className="w-4 h-4" />, label: "Settings", href: "/settings" },
    { icon: <CreditCard className="w-4 h-4" />, label: "Billing", href: "/billing" },
    { icon: <Zap className="w-4 h-4" />, label: "Upgrade Plan", href: "/upgrade" },
    { icon: <LogOut className="w-4 h-4" />, label: "Logout", href: "/" },
  ];

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-0 h-16 bg-white/80 dark:bg-gray-900/80 
                     backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 z-40
                     lg:ml-0">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title */}
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              {type === "admin" ? "Admin Dashboard" : "User Dashboard"}
            </h1>
          </div>

          {/* Search bar - hidden on mobile */}
          {!isMobile && (
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 rounded-xl border border-gray-300 dark:border-gray-600 
                         bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all text-sm"
              />
            </div>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Search button - mobile only */}
          {isMobile && (
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Help */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Help & Support"
          >
            <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl 
                              border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{notifications.length} unread</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 
                                 dark:hover:bg-gray-700 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 dark:text-white">{notification.text}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full text-center text-sm text-brand-600 hover:text-brand-700 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <span className="font-bold text-white text-sm">
                  {type === "admin" ? "A" : "U"}
                </span>
              </div>
              {!isMobile && (
                <>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {type === "admin" ? "Administrator" : "John Doe"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {type === "admin" ? "System Admin" : "Premium User"}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </>
              )}
            </button>

            {/* User menu dropdown */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl 
                              border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {type === "admin" ? "Administrator" : "John Doe"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {type === "admin" ? "admin@suretalk.com" : "john@example.com"}
                    </p>
                  </div>
                  <div className="p-2">
                    {userMenuItems.map((item, index) => (
                      <a
                        key={index}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 
                                 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </div>
                  {type !== "admin" && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 
                                       bg-gradient-to-r from-brand-600 to-accent-500 text-white 
                                       rounded-lg hover:shadow-lg transition-all text-sm">
                        <Zap className="w-4 h-4" />
                        Upgrade Plan
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}