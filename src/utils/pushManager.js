export class PushNotificationManager {
    constructor() {
      this.registration = null;
      this.subscription = null;
      
      // SAFE: Check if we're in browser before accessing Notification
      this.permission = this.getPermission();
    }
  
    // Safe method to get notification permission
    getPermission() {
      // Check if we're in browser with Notification support
      if (typeof window === 'undefined' || typeof Notification === 'undefined') {
        return 'denied'; // Default on server
      }
      return Notification.permission;
    }
  
    // Check if push notifications are supported
    isSupported() {
      // Check if we're in browser
      if (typeof window === 'undefined') {
        return false;
      }
      
      // Check for required APIs
      return 'serviceWorker' in navigator && 'PushManager' in window;
    }
  
    // Check if notifications are granted
    isGranted() {
      return this.permission === 'granted';
    }
  
    // Check if notifications are denied
    isDenied() {
      return this.permission === 'denied';
    }
  
    // Request permission
    async requestPermission() {
      if (!this.isSupported()) {
        throw new Error('Push notifications are not supported');
      }
  
      if (this.isDenied()) {
        throw new Error('Notifications are blocked. Please enable them in your browser settings.');
      }
  
      try {
        this.permission = await Notification.requestPermission();
        
        if (this.permission !== 'granted') {
          throw new Error('Permission not granted');
        }
  
        return true;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        throw error;
      }
    }
  
    // Register service worker
    async registerServiceWorker() {
      if (!this.isSupported()) {
        throw new Error('Service workers are not supported');
      }
  
      try {
        this.registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });
  
        console.log('Service Worker registered with scope:', this.registration.scope);
        return this.registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    }
  
    // Get subscription
    async getSubscription() {
      if (!this.registration) {
        await this.registerServiceWorker();
      }
  
      try {
        this.subscription = await this.registration.pushManager.getSubscription();
        return this.subscription;
      } catch (error) {
        console.error('Error getting subscription:', error);
        throw error;
      }
    }
  
    // Subscribe to push notifications
    async subscribe() {
      if (!this.isSupported()) {
        throw new Error('Push notifications are not supported');
      }
  
      if (!this.isGranted()) {
        const granted = await this.requestPermission();
        if (!granted) {
          throw new Error('Permission not granted');
        }
      }
  
      if (!this.registration) {
        await this.registerServiceWorker();
      }
  
      try {
        // Generate VAPID keys (public key should be from your server)
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        
        if (!vapidPublicKey) {
          throw new Error('VAPID public key is not configured');
        }
  
        // Convert base64 string to Uint8Array
        const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);
  
        // Subscribe to push notifications
        this.subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        });
  
        console.log('Push notification subscription successful:', this.subscription);
        return this.subscription;
      } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        
        // Handle specific errors
        if (error.name === 'NotAllowedError') {
          throw new Error('Notification permission denied');
        } else if (error.name === 'InvalidStateError') {
          throw new Error('Already subscribed to push notifications');
        } else if (error.name === 'AbortError') {
          throw new Error('Subscription process was aborted');
        } else {
          throw error;
        }
      }
    }
  
    // Unsubscribe from push notifications
    async unsubscribe() {
      if (!this.subscription) {
        return true;
      }
  
      try {
        const success = await this.subscription.unsubscribe();
        
        if (success) {
          this.subscription = null;
          console.log('Unsubscribed from push notifications');
        }
        
        return success;
      } catch (error) {
        console.error('Error unsubscribing from push notifications:', error);
        throw error;
      }
    }
  
    // Send subscription to server
    async sendSubscriptionToServer(subscription) {
      try {
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subscription }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to save subscription to server');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error sending subscription to server:', error);
        throw error;
      }
    }
  
    // Delete subscription from server
    async deleteSubscriptionFromServer() {
      try {
        const response = await fetch('/api/push/unsubscribe', {
          method: 'POST',
        });
  
        if (!response.ok) {
          throw new Error('Failed to delete subscription from server');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error deleting subscription from server:', error);
        throw error;
      }
    }
  
    // Initialize push notifications
    async initialize() {
      if (!this.isSupported()) {
        return { supported: false, subscribed: false };
      }
  
      try {
        // Register service worker
        await this.registerServiceWorker();
  
        // Get existing subscription
        const subscription = await this.getSubscription();
        
        if (subscription) {
          this.subscription = subscription;
          return { supported: true, subscribed: true };
        } else {
          return { supported: true, subscribed: false };
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
        return { supported: true, subscribed: false, error: error.message };
      }
    }
  
    // Enable push notifications
    async enable() {
      try {
        const subscription = await this.subscribe();
        
        if (subscription) {
          await this.sendSubscriptionToServer(subscription);
          return { success: true, subscription };
        }
        
        return { success: false, error: 'Failed to subscribe' };
      } catch (error) {
        console.error('Error enabling push notifications:', error);
        return { success: false, error: error.message };
      }
    }
  
    // Disable push notifications
    async disable() {
      try {
        await this.unsubscribe();
        await this.deleteSubscriptionFromServer();
        return { success: true };
      } catch (error) {
        console.error('Error disabling push notifications:', error);
        return { success: false, error: error.message };
      }
    }
  
    // Check if push notifications are enabled
    async isEnabled() {
      if (!this.isSupported()) {
        return false;
      }
  
      const subscription = await this.getSubscription();
      return !!subscription && this.isGranted();
    }
  
    // Convert base64 string to Uint8Array
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
  
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
  
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
  
      return outputArray;
    }
  
    // Send test notification
    async sendTestNotification() {
      try {
        const response = await fetch('/api/push/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to send test notification');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error sending test notification:', error);
        throw error;
      }
    }
  
    // Display local notification (for testing)
  showLocalNotification(title, options) {
    // Check if we're in browser
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      console.warn('Cannot show notification: not in browser');
      return;
    }

    if (!this.isGranted()) {
      console.warn('Cannot show notification: permission not granted');
      return;
    }

    const defaultOptions = {
      body: '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        url: '/usersDashboard'
      }
    };

    const notificationOptions = { ...defaultOptions, ...options };

    if (this.registration) {
      this.registration.showNotification(title, notificationOptions);
    } else {
      new Notification(title, notificationOptions);
    }
  }
}   
  
  // Create singleton instance
  export const pushManager = new PushNotificationManager();