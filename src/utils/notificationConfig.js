// Check if push notifications should be enabled for current page
export const shouldEnablePushNotifications = () => {
    // Don't enable in admin pages
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return !path.includes('/adminDashboard');
    }
    return true;
  };
  
  // Safe notification permission check
  export const safeRequestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    
    if (Notification.permission === 'denied') {
      return 'denied';
    }
    
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.warn('Notification permission request failed:', error);
      return 'denied';
    }
  };