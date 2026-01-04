// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\components\dashboard\Topbar.js (Updated)
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
  LogOut,
  Volume2,
  MessageSquare,
  Shield,
  AlertTriangle,
  CheckCircle,
  X,
  Check
} from "lucide-react";
import { api } from "@/utils/api";
import { toast } from "react-hot-toast";

export default function Topbar({ type, onMenuClick, sidebarCollapsed = false, userData = null, loading = false }) {
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    // Load notifications
    loadNotifications();
    
    // Set up WebSocket for real-time updates
    setupWebSocket();
    
    // Request push notification permission
    requestNotificationPermission();
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await api.request('/notifications?limit=10');
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const setupWebSocket = () => {
    // Connect to WebSocket for real-time notifications
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.hostname}:5000`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected for notifications');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        // Add new notification to the top
        setNotifications(prev => [data.notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show desktop notification if allowed
        if (Notification.permission === 'granted' && data.notification.priority !== 'low') {
          showDesktopNotification(data.notification);
        }
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting...');
      setTimeout(setupWebSocket, 3000);
    };
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }
    
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Subscribe to push notifications
        subscribeToPushNotifications();
      }
    } else if (Notification.permission === 'granted') {
      subscribeToPushNotifications();
    }
  };

  const subscribeToPushNotifications = async () => {
    // Skip for admin pages
    if (window.location.pathname.includes('/adminDashboard')) {
      console.log('Skipping push notifications for admin page');
      return;
    }
    
    try {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.log('Service workers not supported');
        return;
      }
      
      // Check if we're on HTTPS (required for push notifications)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.log('Push notifications require HTTPS in production');
        return;
      }
      
      const registration = await navigator.serviceWorker.ready;
      
      // Check if pushManager is available
      if (!('pushManager' in registration)) {
        console.log('Push notifications not supported');
        return;
      }
      
      // Check for VAPID key
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        console.warn('VAPID public key not configured');
        return;
      }
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
      });
      
      await api.request('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent
        })
      });
      
      console.log('Push notification subscription successful');
      
    } catch (error) {
      // Don't show error for admin pages or if push is not supported
      if (error.name === 'AbortError' || 
          error.name === 'NotAllowedError' || 
          error.message.includes('push service')) {
        console.log('Push notifications not available:', error.message);
      } else {
        console.error('Failed to subscribe to push notifications:', error);
      }
    }
  };

  const showDesktopNotification = (notification) => {
    const options = {
      body: notification.message,
      icon: notification.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      data: {
        url: notification.data?.url || '/usersDashboard',
        notificationId: notification.id
      }
    };
    
    const n = new Notification(notification.title, options);
    
    n.onclick = () => {
      window.focus();
      n.close();
      if (notification.data?.url) {
        window.location.href = notification.data.url;
      }
    };
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.request(`/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.request('/notifications/mark-all-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await api.request(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { className: "w-4 h-4 flex-shrink-0" };
    
    switch (type) {
      case 'voice_note':
        return <Volume2 {...iconProps} className="text-blue-500" />;
      case 'message':
        return <MessageSquare {...iconProps} className="text-green-500" />;
      case 'legacy_vault':
        return <Shield {...iconProps} className="text-purple-500" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="text-yellow-500" />;
      case 'success':
        return <CheckCircle {...iconProps} className="text-green-500" />;
      case 'system':
        return <Globe {...iconProps} className="text-gray-500" />;
      default:
        return <Bell {...iconProps} className="text-brand-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'high':
        return 'bg-gradient-to-r from-orange-500 to-yellow-500';
      case 'normal':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'low':
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
      default:
        return 'bg-gradient-to-r from-brand-500 to-accent-500';
    }
  };

  const userMenuItems = type === "admin" ? [
    { icon: <User className="w-4 h-4" />, label: "Admin Profile", href: "/admin/profile" },
    { icon: <Settings className="w-4 h-4" />, label: "System Settings", href: "/admin/settings" },
    { icon: <Globe className="w-4 h-4" />, label: "Logs", href: "/admin/logs" },
    { icon: <LogOut className="w-4 h-4" />, label: "Logout", href: "/" },
  ] : [
    { icon: <User className="w-4 h-4" />, label: "Profile", href: "/usersDashboard/profile" },
    { icon: <Settings className="w-4 h-4" />, label: "Settings", href: "/usersDashboard/settings" },
    { icon: <CreditCard className="w-4 h-4" />, label: "Billing", href: "/usersDashboard/billing" },
    { icon: <Zap className="w-4 h-4" />, label: "Upgrade Plan", href: "/usersDashboard/upgrade" },
    { icon: <LogOut className="w-4 h-4" />, label: "Logout", href: "/" },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getTopbarWidth = () => {
    if (isMobile) return "left-0 w-full";
    if (sidebarCollapsed) return "lg:left-20 lg:w-[calc(100%-5rem)]";
    return "lg:left-64 lg:w-[calc(100%-16rem)]";
  };

  // Utility function for VAPID key
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return (
    <header className={`fixed top-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 z-50
      ${getTopbarWidth()}`}>
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs 
                               rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl 
                              border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {unreadCount} unread • {notifications.length} total
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs px-3 py-1 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-lg hover:shadow-md"
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={() => window.location.href = '/usersDashboard/notifications'}
                        className="text-xs px-3 py-1 border border-brand-500 text-brand-600 dark:text-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We'll notify you when there's news</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 
                                   transition-all cursor-pointer ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-full rounded-full ${getPriorityColor(notification.priority)}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {getNotificationIcon(notification.type)}
                                  <h4 className={`font-medium truncate ${notification.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-800 dark:text-white'}`}>
                                    {notification.title}
                                  </h4>
                                </div>
                                <button
                                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3 text-gray-500" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {notification.time || formatTime(notification.created_at)}
                                </span>
                                {!notification.is_read && (
                                  <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-full">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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
                  {loading ? '' : (userData?.full_name?.charAt(0) || 'U')}
                </span>
              </div>
              {!isMobile && (
                <>
                  <div className="hidden md:block text-left">
                    {loading ? (
                      <div className="space-y-1">
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {userData?.full_name || (type === "admin" ? "Administrator" : "User")}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {type === "admin" ? "System Admin" : userData?.subscription_tier || 'User'}
                        </p>
                      </>
                    )}
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
                    {loading ? (
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {userData?.full_name || 'User'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {userData?.email || (type === "admin" ? "admin@suretalk.com" : "user@example.com")}
                        </p>
                      </>
                    )}
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

// Helper function to format time
function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}