// In public/service-worker.js, update the push event handler:


// Add at the beginning of service-worker.js
self.addEventListener('install', (event) => {
  console.log('Service Worker installing for:', self.registration.scope);
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
    if (!event.data) return;
  
    const data = event.data.json();
    
    // Store notification in IndexedDB for offline access
    storeNotification(data);
    
    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      image: data.image,
      data: data.data,
      actions: [
        {
          action: 'open',
          title: 'Open'
        },
        {
          action: 'mark-read',
          title: 'Mark as Read'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      vibrate: data.vibrate || [200, 100, 200],
      requireInteraction: data.requireInteraction || false,
      tag: data.tag || 'suretalk-notification'
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });
  
  // Handle notification actions
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
  
    if (event.action === 'open') {
      const urlToOpen = event.notification.data?.url || '/usersDashboard';
      
      event.waitUntil(
        clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        }).then((windowClients) => {
          for (const client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
      );
      
    } else if (event.action === 'mark-read') {
      // Mark notification as read via API
      const notificationId = event.notification.data?.notificationId;
      if (notificationId) {
        markNotificationAsRead(notificationId);
      }
      
    } else if (event.action === 'dismiss') {
      // Just close the notification
    }
  });
  
  // Store notification in IndexedDB
  async function storeNotification(notification) {
    const db = await openDatabase();
    const tx = db.transaction('notifications', 'readwrite');
    const store = tx.objectStore('notifications');
    
    await store.put({
      ...notification,
      id: notification.data?.notificationId || Date.now().toString(),
      timestamp: new Date().toISOString(),
      isRead: false
    });
    
    await tx.done;
  }
  
  // Mark notification as read
  async function markNotificationAsRead(notificationId) {
    const db = await openDatabase();
    const tx = db.transaction('notifications', 'readwrite');
    const store = tx.objectStore('notifications');
    
    const notification = await store.get(notificationId);
    if (notification) {
      notification.isRead = true;
      await store.put(notification);
    }
    
    await tx.done;
  }
  
  // Open IndexedDB
  async function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SureTalkNotifications', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('notifications')) {
          const store = db.createObjectStore('notifications', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('isRead', 'isRead');
        }
      };
      
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }