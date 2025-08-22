// Digital Wallet - Background Service Worker

// Initialize with empty wallet on install (only if no data exists)
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Check if data already exists (from sync)
    const existingData = await chrome.storage.sync.get(['walletCards']);
    
    // Only set empty array if no synced data exists
    if (!existingData.walletCards || existingData.walletCards.length === 0) {
      await chrome.storage.sync.set({ walletCards: [] });
      console.log('Digital Wallet: Initialized with empty wallet');
    } else {
      console.log('Digital Wallet: Found existing synced data with', existingData.walletCards.length, 'items');
    }
  }
});
