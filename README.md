# Digital Wallet - Edge Browser Extension

A simple and elegant browser extension to store and quickly copy your social media links, usernames, and other frequently used text items. **Now with MongoDB Atlas integration for enhanced data persistence and cross-device sync!**

## 🌟 **New: MongoDB Atlas Integration**

- **🔒 Your Own Database**: Connect to your personal MongoDB Atlas cluster
- **🌍 Global Sync**: Access your data from anywhere with internet connection
- **💰 Free Tier**: MongoDB Atlas free tier supports up to 512MB of data
- **🛡️ Private & Secure**: Your data stays in your own database cluster
- **⚡ Real-time Sync**: Instant synchronization across all devices
- **📦 Easy Setup**: One-time configuration with environment variables

## 🔄 **Data Persistence & Sync Features**

- **🌐 Cross-Device Sync**: Data automatically syncs when you're signed into Edge/Chrome
- **🗄️ MongoDB Atlas**: Optional cloud database integration for enhanced persistence
- **💾 Local Backup**: Data is also stored locally as a backup
- **📱 Offline Support**: Works offline, syncs when reconnected
- **🔄 Real-time Sync**: Changes sync immediately across all your devices
- **🛡️ Data Recovery**: Multiple storage layers ensure your data is never lost
- **📊 Sync Status**: Visual indicator shows sync status (synced/pending/offline)

## Features

- 📌 **Store Items**: Save your social media usernames, profile links, email addresses, and any other text
- 📋 **One-Click Copy**: Copy any stored item to clipboard with a single click
- ✏️ **Edit Items**: Modify existing items easily
- 🗑️ **Delete Items**: Remove items you no longer need
- 💾 **Persistent Storage**: Your data survives browser restarts, computer shutdowns, and device switches
- 🎨 **Beautiful UI**: Clean, modern interface with sync status indicator
- 🔄 **Auto-Sync**: Automatic syncing every 30 seconds when online

## Installation

### Option 1: Developer Mode (Recommended for now)

1. Open Microsoft Edge
2. Go to `edge://extensions/`
3. Enable "Developer mode" toggle in the left sidebar
4. Click "Load unpacked"
5. Select the `item pinner` folder
6. The extension will appear in your toolbar

### Option 2: Edge Add-ons Store (Future)

Once published to the Microsoft Edge Add-ons store, you can install it directly from there.

## 🔧 **MongoDB Atlas Setup (Optional but Recommended)**

For enhanced data persistence and cross-device sync, connect to MongoDB Atlas:

### Quick Setup (Windows)
1. Run `setup-mongodb.bat` - this will guide you through the entire process
2. Or follow the manual setup below:

### Manual Setup
1. **Get MongoDB Atlas credentials** (see [MONGODB_SETUP.md](MONGODB_SETUP.md) for detailed instructions)
2. **Edit `.env` file** with your credentials:
   ```bash
   MONGODB_ATLAS_API_KEY=your_actual_api_key
   MONGODB_ATLAS_DATA_API_URL=your_actual_data_api_url
   ```
3. **Generate configuration**: Run `build-config.ps1`
4. **Reload extension** in Edge

### Benefits of MongoDB Atlas Integration
- ✅ Data persists even if browser storage is cleared
- ✅ Sync across unlimited devices
- ✅ Access your data from any browser
- ✅ Professional-grade data backup and security
- ✅ Free tier supports 512MB of data

## Usage

1. **Click the extension icon** in your toolbar to open the popup
2. **Check sync status**: Green checkmark = synced, spinning icon = syncing, red = offline
3. **Add new items**:
   - Click the "+ Add Item" button
   - Enter a name (e.g., "Instagram", "LinkedIn")
   - Enter the value (e.g., "@username", "profile URL")
   - Click "Save" - **Data is immediately synced across your devices**

4. **Copy items**:
   - Click the green "Copy" button next to any item
   - The text will be copied to your clipboard
   - You'll see a confirmation message

5. **Edit items**:
   - Click the yellow "Edit" button
   - Modify the name or value
   - Click "Update" - **Changes sync immediately**

6. **Delete items**:
   - Click the red "Delete" button
   - Confirm the deletion - **Deletion syncs across devices**

7. **Manual sync**: Click the sync status indicator to force an immediate sync

## Sample Items Included

The extension comes with some sample social media items:
- Instagram: @your_username
- LinkedIn: https://linkedin.com/in/your-profile
- Twitter/X: @your_handle
- Email: your.email@example.com

You can edit or delete these and add your own items.

## File Structure

```
item pinner/
├── manifest.json       # Extension configuration
├── popup.html         # Main popup interface
├── popup.js          # JavaScript functionality
├── background.js     # Background service worker
├── icons/           # Extension icons (you need to add these)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md        # This file
```

## Creating Icons

You need to create PNG icon files in the `icons` folder. Here are the required sizes:
- `icon16.png` - 16x16 pixels
- `icon32.png` - 32x32 pixels  
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

### Icon Suggestions:
- Use a pushpin (📌) or clipboard icon
- Keep it simple and recognizable at small sizes
- Use colors that work well on both light and dark themes
- Consider using tools like:
  - [favicon.io](https://favicon.io) - Generate icons from text or images
  - [Canva](https://canva.com) - Create custom icons
  - [Icons8](https://icons8.com) - Download free icons

## Technical Details

- **Manifest Version**: 3 (latest standard)
- **Permissions**: 
  - `storage` - To save your pinned items
  - `clipboardWrite` - To copy text to clipboard
- **Storage**: Uses Chrome sync storage (syncs across devices)
- **Compatibility**: Works with Microsoft Edge and Chrome

## Privacy & Data Security

- **✅ Your data is safe**: Stored in Edge/Chrome's secure sync storage
- **✅ No external servers**: Data stays within Microsoft/Google's infrastructure
- **✅ Encrypted sync**: Data is encrypted during transmission and storage
- **✅ Account-based**: Only accessible when signed into your Edge/Chrome account
- **✅ Local backup**: Additional local storage backup for offline access
- **✅ No tracking**: Extension doesn't collect or transmit any personal data

## How Sync Works

1. **Sign into Edge/Chrome**: Your account enables cross-device sync
2. **Automatic sync**: Data syncs every 30 seconds when online
3. **Instant sync**: Manual sync available by clicking sync status
4. **Multi-device**: Access your data on any device where you're signed in
5. **Offline support**: Works offline, syncs when reconnected
6. **Conflict resolution**: Smart merging when data changes on multiple devices

## Troubleshooting

### Data Not Syncing?
- Ensure you're signed into Edge/Chrome with the same account
- Check internet connection
- Click the sync status indicator to force sync
- Wait a few minutes for sync to propagate

### Lost Data?
- Check other devices where you use the extension
- Look for local backup (automatically restored on extension update)
- Sample data reappears if no data is found

## Contributing

Feel free to submit issues or pull requests to improve the extension!

## License

MIT License - feel free to modify and distribute.

---

**Enjoy quickly accessing your social media handles and other frequently used text! 🚀**
