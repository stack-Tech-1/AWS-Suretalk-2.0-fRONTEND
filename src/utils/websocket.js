class StorageWebSocket {
    constructor() {
      this.socket = null;
      this.listeners = new Map();
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
    }
  
    connect() {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        return;
      }
  
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
      this.socket = new WebSocket(`${wsUrl}/ws/storage`);
  
      this.socket.onopen = () => {
        console.log('Storage WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', { timestamp: new Date() });
      };
  
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit('message', data);
          
          // Emit specific event types
          if (data.type) {
            this.emit(data.type, data);
          }
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      };
  
      this.socket.onclose = () => {
        console.log('Storage WebSocket disconnected');
        this.emit('disconnected', { timestamp: new Date() });
        
        // Attempt reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), 1000 * Math.pow(2, this.reconnectAttempts));
        }
      };
  
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', { error: error.message });
      };
    }
  
    disconnect() {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
      this.listeners.clear();
    }
  
    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event).add(callback);
    }
  
    off(event, callback) {
      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback);
      }
    }
  
    emit(event, data) {
      if (this.listeners.has(event)) {
        this.listeners.get(event).forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`WebSocket listener error for event ${event}:`, error);
          }
        });
      }
    }
  
    send(type, data) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type, data }));
      }
    }
  
    // Subscribe to storage updates
    subscribeToStorage(bucket = null) {
      this.send('subscribe', { channel: 'storage', bucket });
    }
  
    // Unsubscribe from storage updates
    unsubscribeFromStorage() {
      this.send('unsubscribe', { channel: 'storage' });
    }
  }
  
  export const storageWebSocket = new StorageWebSocket();