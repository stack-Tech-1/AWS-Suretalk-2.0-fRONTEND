//C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\src\components\dashboard\Sidebar.js
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Home, MessageSquare, Users, Shield, Settings, Bell, 
  BarChart3, FileText, Calendar, Archive, Download,
  Upload, HelpCircle, LogOut, ChevronLeft, ChevronRight,
  Smartphone, Mic, Clock, UserCheck, X, FileAudio,
  Contact, ClipboardList, Lock, Crown
} from "lucide-react";
import { UserProfileSkeleton, SidebarCountSkeleton } from '../ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext'; // ✅ Import useAuth

export default function Sidebar({ 
  type, 
  isOpen, 
  collapsed, 
  onCollapse, 
  onClose,
  userData, // Still passed from layout for backwards compatibility
  stats,
  loading = false
}) {
  const router = useRouter();
  const { user, hasLegacyVault, loading: authLoading, logout, profileImageUrl } = useAuth(); // ✅ Use AuthContext

  // ✅ Use user from AuthContext if available, fallback to prop
  const currentUser = user || userData;
  const userTier = currentUser?.subscription_tier;
  const loadingTier = authLoading;

  // User menu items - DYNAMIC BASED ON TIER
  const getUserMenu = () => {
    const baseMenu = [
      { 
        icon: <Home className="w-5 h-5" />, 
        label: "Dashboard", 
        href: "/usersDashboard", 
        count: null,
        availableFor: ['LITE', 'ESSENTIAL', 'LEGACY_VAULT_PREMIUM']
      },
      { 
        icon: <Mic className="w-5 h-5" />, 
        label: "Voice Notes", 
        href: "/usersDashboard/voice-notes", 
        count: loading ? null : stats?.voiceNotes || 0,
        availableFor: ['LITE', 'ESSENTIAL', 'LEGACY_VAULT_PREMIUM']
      },
      { 
        icon: <Users className="w-5 h-5" />, 
        label: "Contacts", 
        href: "/usersDashboard/contacts", 
        count: loading ? null : stats?.contacts || 0,
        availableFor: ['LITE', 'ESSENTIAL', 'LEGACY_VAULT_PREMIUM']
      },
      { 
        icon: <Calendar className="w-5 h-5" />, 
        label: "Scheduled", 
        href: "/usersDashboard/scheduled", 
        count: loading ? null : stats?.scheduled || 0,
        availableFor: ['ESSENTIAL', 'LEGACY_VAULT_PREMIUM'] // LITE doesn't get scheduled
      },
      { 
        icon: <Settings className="w-5 h-5" />, 
        label: "Settings", 
        href: "/usersDashboard/settings", 
        count: null,
        availableFor: ['LITE', 'ESSENTIAL', 'LEGACY_VAULT_PREMIUM']
      },
    ];

    // ✅ Add Legacy Vault ONLY for LEGACY_VAULT_PREMIUM users (using helper from context)
    if (hasLegacyVault()) {
      baseMenu.splice(3, 0, { // Insert after Contacts, before Scheduled
        icon: <Shield className="w-5 h-5" />,
        label: "Voice Wills",
        href: "/usersDashboard/vault",
        count: loading ? null : stats?.vault || 0,
        availableFor: ['LEGACY_VAULT_PREMIUM'],
        premium: true
      });
    }

    return baseMenu;
  };

  const extractNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'object') {
      if (value.total && typeof value.total === 'object') {
        return value.total.total || 0;
      }
      return value.total || value.scheduled || value.pending || value.count || 0;
    }
    return 0;
  };

  const adminMenu = [
    { icon: <BarChart3 className="w-5 h-5" />, label: "Overview", href: "/adminDashboard", count: null },
    { icon: <Users className="w-5 h-5" />, label: "Users", href: "/adminDashboard/users", count: loading ? null : extractNumber(stats?.users) },
    { icon: <MessageSquare className="w-5 h-5" />, label: "Voice Wills", href: "/adminDashboard/wills", count: loading ? null : extractNumber(stats?.wills) },
    { icon: <Clock className="w-5 h-5" />, label: "Scheduled", href: "/adminDashboard/messages", count: loading ? null : extractNumber(stats?.scheduled) },
    { icon: <FileText className="w-5 h-5" />, label: "System Logs", href: "/adminDashboard/logs", count: loading ? null : extractNumber(stats?.logs) },
    { icon: <Archive className="w-5 h-5" />, label: "Storage", href: "/adminDashboard/storage", count: null },
    { icon: <ClipboardList className="w-5 h-5" />, label: "Admin requests", href: "/adminDashboard/admin-requests", count: loading ? null : extractNumber(stats?.pendingRequests) },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/adminDashboard/settings", count: null },
  ];

  const menu = type === "admin" ? adminMenu : getUserMenu();

  // Update the NavItem component
  const NavItem = ({ item, stats }) => {
    const isActive = router.pathname === item.href;
    
    // Check if item should be available for current user tier
    const isAvailable = !item.availableFor ||
                       !userTier ||
                       item.availableFor.includes(userTier);
    
    // If loading tier, show skeleton
    if (loadingTier && type !== 'admin' && item.availableFor) {
      return (
        <div className="px-4 py-3 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            {!collapsed && (
              <>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                {item.count !== null && <SidebarCountSkeleton />}
              </>
            )}
          </div>
        </div>
      );
    }
    
    // If not available for user tier, don't render
    if (!isAvailable && type !== 'admin') {
      return null;
    }
    
    // Helper to render count based on type
    const renderCount = () => {
      if (item.count === null || loading) {
        return loading && item.count !== null ? <SidebarCountSkeleton /> : null;
      }
      
      // Special handling for Voice Wills (show total + pending)
      if (item.label === "Voice Wills" && stats && typeof stats.wills === 'object') {
        let total = 0;
        let pending = 0;
        
        if (stats.wills.total && typeof stats.wills.total === 'object') {
          total = stats.wills.total.total || 0;
          pending = stats.wills.total.pending || 0;
        } else {
          total = stats.wills.total || 0;
          pending = stats.wills.pending || 0;
        }
        
        return (
          <div className="flex gap-1">
            <span className={`px-1.5 py-0.5 text-xs rounded-full ${
              isActive 
                ? 'bg-white/30 text-white' 
                : 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
            }`}>
              {total}
            </span>
            
            {pending > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                isActive 
                  ? 'bg-yellow-500/30 text-white' 
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
              }`}>
                {pending}
              </span>
            )}
          </div>
        );
      }
      
      // Regular number count
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${
          isActive 
            ? 'bg-white/20 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }`}>
          {item.count}
        </span>
      );
    };
    
    // Premium badge for Legacy Vault
    const renderPremiumBadge = () => {
      if (item.premium && !collapsed) {
        return (
          <span className="ml-auto px-1.5 py-0.5 text-xs bg-gradient-to-r from-brand-700 to-accent-600
                         text-white rounded-full">
            PREMIUM
          </span>
        );
      }
      return null;
    };
    
    return (
      <Link href={item.href}>
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer
            ${isActive
              ? 'nav-active font-semibold'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white hover:pl-5'
            }`}
          onClick={onClose}
        >
          <div className={`flex-shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-brand-500'}`}>
            {item.icon}
          </div>
          {!collapsed && (
            <>
              <span className="font-medium flex-1">{item.label}</span>
              {item.count !== null && renderCount()}
              {renderPremiumBadge()}
            </>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className={`h-full flex flex-col ${collapsed ? 'items-center' : ''}`}>
      {/* Header */}
      <div className={`p-6 border-b border-white/20 dark:border-white/5 ${collapsed ? 'px-4' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <img 
                src="https://i.postimg.cc/9MbyJVL4/cropped-fulllogo-edited.webp" 
                alt="SureTalk Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h2 className="font-display font-bold text-lg gradient-text tracking-tight">
                  SureTalk
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">
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
          <div className="mt-6 p-4 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            {loadingTier ? (
              <UserProfileSkeleton />
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-white text-sm">
                        {currentUser?.full_name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  {/* Tier badge */}
                  {userTier && (
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center
                      ${userTier === 'LEGACY_VAULT_PREMIUM' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                        userTier === 'ESSENTIAL' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        'bg-gradient-to-r from-gray-500 to-gray-400'}`}>
                      {userTier === 'LEGACY_VAULT_PREMIUM' ? (
                        <Crown className="w-2.5 h-2.5 text-white" />
                      ) : userTier === 'ESSENTIAL' ? (
                        <Shield className="w-2.5 h-2.5 text-white" />
                      ) : (
                        <Smartphone className="w-2.5 h-2.5 text-white" />
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {currentUser?.full_name || 'User'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                      userTier === 'LEGACY_VAULT_PREMIUM' ? 'tier-pro' :
                      userTier === 'ESSENTIAL' ? 'tier-essential' : 'tier-lite'
                    }`}>
                      {userTier === 'LEGACY_VAULT_PREMIUM' ? 'Pro' :
                       userTier === 'ESSENTIAL' ? 'Essential' : 'Lite'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 p-4 space-y-2 overflow-y-auto ${collapsed ? 'px-2' : ''}`}>
        {menu.map((item, index) => (
          <NavItem key={index} item={item} stats={stats} />
        ))}

        {/* Super Admin — distinct red/orange entry, admin sidebar only */}
        {type === 'admin' && (
          <Link href="/adminDashboard/super" onClick={onClose}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
              bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-200/50 dark:border-red-800/50
              text-red-600 dark:text-red-400 hover:from-red-500/20 hover:to-orange-500/20
              ${collapsed ? 'justify-center px-3' : ''}`}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium flex-1">Super Admin</span>}
            </div>
          </Link>
        )}
        
        {/* ✅ Upgrade Prompt for non-LEGACY_VAULT_PREMIUM users (using helper) */}
        {type !== "admin" && !(hasLegacyVault?.()) && !collapsed && (
          <div className="mt-4 p-4 rounded-xl card-glow bg-white/60 dark:bg-white/5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg brand-gradient flex-shrink-0">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">
                  Unlock Voice Wills
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                  Preserve your voice legacy forever
                </p>
                <Link href="/usersDashboard/billing" className="mt-2.5 block">
                  <button className="btn-primary w-full text-xs py-1.5 px-3 rounded-lg">
                    Upgrade Now
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-white/20 dark:border-white/5 ${collapsed ? 'px-2' : ''}`}>
        <div className="space-y-3">
          {/* Help */}
          <Link href={type === "admin" ? "/adminDashboard/helpandsupport" : "/usersDashboard/helpandsupport"}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 
                            hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer
                            ${collapsed ? 'justify-center px-3' : ''}`}>
              <HelpCircle className="w-5 h-5" />
              {!collapsed && <span className="font-medium">Help & Support</span>}
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600
                        hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
                        ${collapsed ? 'justify-center px-3' : ''}`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
          
          {/* Version info - only when not collapsed */}
          {!collapsed && (
            <div className="pt-4 border-t border-white/20 dark:border-white/5">
              <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                v2.0.0 • {type === "admin" ? "Admin" : "User"} Mode
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}