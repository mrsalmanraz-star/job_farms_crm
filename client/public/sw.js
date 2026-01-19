// Service Worker for JOB FARMS CRM - Offline-First PWA
const CACHE_NAME = 'job-farms-crm-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Continue even if some assets fail to cache
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls - let them fail gracefully if offline
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Offline - API unavailable' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // Network first strategy for other resources
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const cache = caches.open(CACHE_NAME);
          cache.then((c) => c.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then((response) => {
          return response || new Response('Offline - Resource unavailable', { status: 503 });
        });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
  if (event.tag === 'sync-clients') {
    event.waitUntil(syncClients());
  }
});

async function syncBookings() {
  try {
    const db = await openIndexedDB();
    const bookings = await getOfflineBookings(db);
    
    for (const booking of bookings) {
      try {
        await fetch('/api/trpc/bookings.create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking),
        });
        await removeOfflineBooking(db, booking.id);
      } catch (error) {
        console.error('Failed to sync booking:', error);
      }
    }
  } catch (error) {
    console.error('Sync bookings failed:', error);
  }
}

async function syncClients() {
  try {
    const db = await openIndexedDB();
    const clients = await getOfflineClients(db);
    
    for (const client of clients) {
      try {
        await fetch('/api/trpc/clients.create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(client),
        });
        await removeOfflineClient(db, client.id);
      } catch (error) {
        console.error('Failed to sync client:', error);
      }
    }
  } catch (error) {
    console.error('Sync clients failed:', error);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('JobFarmsCRM', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineBookings')) {
        db.createObjectStore('offlineBookings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('offlineClients')) {
        db.createObjectStore('offlineClients', { keyPath: 'id' });
      }
    };
  });
}

function getOfflineBookings(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offlineBookings', 'readonly');
    const store = transaction.objectStore('offlineBookings');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getOfflineClients(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offlineClients', 'readonly');
    const store = transaction.objectStore('offlineClients');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeOfflineBooking(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offlineBookings', 'readwrite');
    const store = transaction.objectStore('offlineBookings');
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function removeOfflineClient(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offlineClients', 'readwrite');
    const store = transaction.objectStore('offlineClients');
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
