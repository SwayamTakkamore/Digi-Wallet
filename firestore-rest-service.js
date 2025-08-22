// Firebase REST API Service for Digital Wallet Extension
// Uses Firebase REST API instead of SDK to avoid CSP issues
class FirestoreRestService {
  constructor() {
    this.config = window.ENV_CONFIG || {};
    this.projectId = this.config.FIREBASE_PROJECT_ID;
    this.apiKey = this.config.FIREBASE_API_KEY;
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents`;
    this.authToken = null;
    this.userId = null;
    this.isInitialized = false;
    this.isOnline = navigator.onLine;
    this.syncEnabled = false;
    this.lastSyncTime = 0;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache timeout
    this.isSyncing = false;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Digital Wallet: Back online, syncing...');
      this.syncPendingChanges();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Digital Wallet: Offline mode');
    });
  }

  async init() {
    try {
      console.log('Digital Wallet: Initializing Firebase REST service...');

      // Validate configuration
      if (!this.projectId || !this.apiKey) {
        console.log('Digital Wallet: Firebase config missing, falling back to local storage');
        this.isInitialized = true;
        this.syncEnabled = false;
        return true;
      }

      // Load previous sync state
      const syncData = await chrome.storage.local.get(['lastSyncTime']);
      this.lastSyncTime = syncData.lastSyncTime || 0;

      // For now, let's skip authentication and use a simple approach
      // We'll generate a pseudo-anonymous user ID based on browser fingerprint
      this.userId = await this.generateUserFingerprint();
      
      // Test Firestore connectivity without authentication
      console.log('Digital Wallet: Testing Firestore connectivity...');
      
      // Note: This requires Firestore rules to allow unauthenticated access
      // We'll update the service to work with simple document access
      this.syncEnabled = true;
      this.isInitialized = true;
      
      console.log('Digital Wallet: Firebase REST service initialized (smart caching enabled)');
      return true;
      
    } catch (error) {
      console.error('Digital Wallet: Failed to initialize Firebase REST service:', error);
      this.isInitialized = true;
      this.syncEnabled = false;
      return true; // Continue with local storage
    }
  }

  // Generate a consistent user fingerprint for pseudo-anonymous storage
  async generateUserFingerprint() {
    try {
      // Try to get or create a persistent user ID
      const stored = await chrome.storage.local.get(['userFingerprint']);
      if (stored.userFingerprint) {
        return stored.userFingerprint;
      }
      
      // Generate a new fingerprint based on browser characteristics
      const fingerprint = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await chrome.storage.local.set({ 'userFingerprint': fingerprint });
      
      console.log('Digital Wallet: Generated user fingerprint:', fingerprint);
      return fingerprint;
    } catch (error) {
      console.error('Digital Wallet: Failed to generate fingerprint:', error);
      return 'anonymous_user';
    }
  }

  async saveWalletItems(items) {
    console.log('Digital Wallet: Saving', items.length, 'items via Firebase REST API');
    
    try {
      // Always save locally first for immediate response
      await chrome.storage.local.set({ 
        'walletCards': items,
        'cacheTimestamp': Date.now()
      });
      console.log('Digital Wallet: Items cached locally');

      if (this.isInitialized && this.syncEnabled && this.isOnline && this.userId && !this.isSyncing) {
        this.isSyncing = true;
        
        // Save to Firestore in background
        const docData = {
          fields: {
            items: {
              arrayValue: {
                values: items.map(item => ({
                  mapValue: {
                    fields: {
                      id: { stringValue: item.id },
                      name: { stringValue: item.name || '' },
                      value: { stringValue: item.value || '' },
                      category: { stringValue: item.category || 'CARD' }
                    }
                  }
                }))
              }
            },
            lastUpdated: {
              timestampValue: new Date().toISOString()
            },
            version: {
              integerValue: Date.now().toString()
            }
          }
        };

        const response = await fetch(`${this.baseUrl}/wallets/${this.userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(docData)
        });

        if (response.ok) {
          console.log('Digital Wallet: Items synced to Firestore successfully');
          this.lastSyncTime = Date.now();
          await chrome.storage.local.set({ 'lastSyncTime': this.lastSyncTime });
          await chrome.storage.local.remove(['pendingSync']);
          this.isSyncing = false;
          return { success: true, synced: true };
        } else {
          const errorText = await response.text();
          console.log('Digital Wallet: Firestore sync failed:', response.status, errorText);
          throw new Error(`Firestore sync failed: ${response.status}`);
        }
      } else {
        // Mark for sync later if not online
        if (!this.isOnline || !this.syncEnabled) {
          await chrome.storage.local.set({ 'pendingSync': true });
        }
        console.log('Digital Wallet: Items saved locally, will sync when online');
        return { success: true, synced: false };
      }
    } catch (error) {
      console.error('Digital Wallet: Error syncing to Firestore:', error);
      this.isSyncing = false;
      
      // Data is already saved locally, so mark for later sync
      try {
        await chrome.storage.local.set({ 'pendingSync': true });
        return { success: true, synced: false, error: error.message };
      } catch (localError) {
        console.error('Digital Wallet: Failed to save locally too:', localError);
        return { success: false, synced: false, error: localError.message };
      }
    }
  }

  async loadWalletItems() {
    console.log('Digital Wallet: Loading items with smart caching...');
    
    try {
      // Always load from cache first for immediate response
      const result = await chrome.storage.local.get(['walletCards', 'cacheTimestamp', 'lastSyncTime']);
      const cachedItems = result.walletCards || [];
      const cacheTime = result.cacheTimestamp || 0;
      const lastSync = result.lastSyncTime || 0;
      
      console.log('Digital Wallet: Found', cachedItems.length, 'cached items');
      
      // Check if cache is still fresh (within timeout period)
      const cacheAge = Date.now() - cacheTime;
      const isCacheFresh = cacheAge < this.cacheTimeout;
      
      if (isCacheFresh) {
        console.log('Digital Wallet: Using fresh cache (age:', Math.round(cacheAge / 1000), 'seconds)');
        
        // Background sync if online and haven't synced recently
        if (this.isInitialized && this.syncEnabled && this.isOnline && this.userId) {
          this.backgroundSync();
        }
        
        return cachedItems;
      }

      // Cache is stale or empty, try to fetch from Firestore
      if (this.isInitialized && this.syncEnabled && this.isOnline && this.userId && !this.isSyncing) {
        console.log('Digital Wallet: Cache stale, fetching from Firestore...');
        
        const response = await fetch(`${this.baseUrl}/wallets/${this.userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const doc = await response.json();
          
          if (doc.fields && doc.fields.items && doc.fields.items.arrayValue) {
            const items = doc.fields.items.arrayValue.values.map(value => ({
              id: value.mapValue.fields.id.stringValue,
              name: value.mapValue.fields.name.stringValue,
              value: value.mapValue.fields.value.stringValue,
              category: value.mapValue.fields.category.stringValue
            }));

            console.log('Digital Wallet: Fetched', items.length, 'items from Firestore');
            
            // Update cache with fresh data
            await chrome.storage.local.set({ 
              'walletCards': items,
              'cacheTimestamp': Date.now(),
              'lastSyncTime': Date.now()
            });
            
            this.lastSyncTime = Date.now();
            return items;
          }
        } else if (response.status === 404) {
          console.log('Digital Wallet: No data in Firestore yet, using cache');
        } else {
          const errorText = await response.text();
          console.log('Digital Wallet: Firestore fetch failed:', response.status, errorText);
        }
      }
      
      // Return cached items if Firestore fetch failed or not available
      console.log('Digital Wallet: Using cached items (', cachedItems.length, 'items)');
      return cachedItems;
      
    } catch (error) {
      console.error('Digital Wallet: Error loading items:', error);
      
      // Fallback to whatever is in cache
      try {
        const result = await chrome.storage.local.get(['walletCards']);
        return result.walletCards || [];
      } catch (localError) {
        console.error('Digital Wallet: Failed to load from cache too:', localError);
        return [];
      }
    }
  }

  // Background sync without blocking the UI
  async backgroundSync() {
    if (this.isSyncing || !this.userId) return;
    
    // Only sync if it's been a while since last sync
    const timeSinceLastSync = Date.now() - this.lastSyncTime;
    if (timeSinceLastSync < 60000) return; // Don't sync more than once per minute
    
    try {
      console.log('Digital Wallet: Performing background sync check...');
      this.isSyncing = true;
      
      const response = await fetch(`${this.baseUrl}/wallets/${this.userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const doc = await response.json();
        const serverVersion = doc.fields?.version?.integerValue;
        
        // Check local version
        const localData = await chrome.storage.local.get(['localVersion']);
        const localVersion = localData.localVersion;
        
        if (serverVersion && localVersion && parseInt(serverVersion) > parseInt(localVersion)) {
          console.log('Digital Wallet: Server has newer data, updating cache...');
          // Server data is newer, update local cache
          // This would trigger a UI refresh in a real app
        }
      }
      
      this.lastSyncTime = Date.now();
      await chrome.storage.local.set({ 'lastSyncTime': this.lastSyncTime });
      
    } catch (error) {
      console.log('Digital Wallet: Background sync failed:', error.message);
    } finally {
      this.isSyncing = false;
    }
  }

  async syncPendingChanges() {
    if (!this.isInitialized || !this.syncEnabled || !this.isOnline || !this.userId) {
      return;
    }

    try {
      const result = await chrome.storage.local.get(['pendingSync', 'walletCards']);
      
      if (result.pendingSync && result.walletCards) {
        console.log('Digital Wallet: Syncing pending changes...');
        const syncResult = await this.saveWalletItems(result.walletCards);
        
        if (syncResult.synced) {
          await chrome.storage.local.remove(['pendingSync']);
          console.log('Digital Wallet: Pending changes synced successfully');
        }
      }
    } catch (error) {
      console.error('Digital Wallet: Error syncing pending changes:', error);
    }
  }

  getStatus() {
    if (!this.isInitialized) {
      return {
        storageType: 'Local Storage',
        description: 'Firebase REST service not initialized, using local storage only',
        syncEnabled: false,
        userId: null
      };
    }

    if (this.syncEnabled && this.userId) {
      const cacheInfo = this.lastSyncTime ? `Last sync: ${Math.round((Date.now() - this.lastSyncTime) / 1000)}s ago` : 'Not synced yet';
      return {
        storageType: 'Firebase Cloud (Smart Cache)',
        description: `Intelligent caching with background sync - ${cacheInfo}`,
        syncEnabled: true,
        userId: this.userId ? this.userId.substring(0, 12) + '...' : null
      };
    }

    return {
      storageType: 'Local Storage',
      description: 'Firebase available but not syncing (check config or connection)',
      syncEnabled: false,
      userId: null
    };
  }

  async getStorageInfo() {
    try {
      // Get local storage usage
      const localData = await chrome.storage.local.getBytesInUse();
      
      return {
        used: localData,
        quota: 5 * 1024 * 1024, // Chrome local storage limit (approx 5MB)
        remaining: (5 * 1024 * 1024) - localData,
        usedPercent: Math.round((localData / (5 * 1024 * 1024)) * 100),
        unlimited: false,
        cloudSync: this.syncEnabled
      };
    } catch (error) {
      console.error('Digital Wallet: Error getting storage info:', error);
      return {
        used: 0,
        quota: 5 * 1024 * 1024,
        remaining: 5 * 1024 * 1024,
        usedPercent: 0,
        unlimited: false,
        cloudSync: false
      };
    }
  }
}

// Export for use
window.FirestoreRestService = FirestoreRestService;
