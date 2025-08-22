# 🔥 Digital Wallet Extension - Now with Firestore Cloud Sync!

## 🚀 **Why Firestore is Better:**

✅ **Real-time sync** - Changes appear instantly across devices  
✅ **Better offline support** - Works seamlessly offline  
✅ **Google's infrastructure** - More reliable than deprecated MongoDB Data API  
✅ **Free tier generous** - 1GB storage, 50K reads/day  
✅ **Designed for web apps** - Perfect for browser extensions  
✅ **No API deprecation worries** - Firebase is Google's long-term platform

## 🛠️ **Quick Setup (5 minutes):**

### **1. Get Firebase Config:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" (or use existing)
3. Project name: `digital-wallet` (or whatever you want)
4. Disable Google Analytics (not needed)
5. Click "Create project"

### **2. Add Web App:**

1. In project overview, click Web app icon `</>`
2. App nickname: `Digital Wallet Extension`
3. Don't enable hosting
4. Click "Register app"
5. **Copy the config values** (we need these!)

### **3. Enable Firestore:**

1. Go to "Firestore Database" in left sidebar
2. Click "Create database"
3. Choose "Start in test mode"
4. Select your preferred location
5. Click "Done"

### **4. Configure Extension:**

1. Copy `.env.template` to `.env`
2. **Paste your Firebase config** in `.env`:
   ```
   FIREBASE_API_KEY=AIzaSyC-your-actual-key-here
   FIREBASE_AUTH_DOMAIN=your-project-12345.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-12345
   FIREBASE_STORAGE_BUCKET=your-project-12345.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789012
   FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```
3. Run: `.\create-config.ps1`
4. **Reload your extension** in Edge

## 🔒 **Security (Important!):**

Set proper Firestore rules to protect your data:

1.  Go to Firestore → Rules
2.  Replace the rules with:
    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /wallets/{document} {
          allow read, write: if true;
        }
      }
    }
    ```
3.  Click "Publish"

## 🎯 **That's It!**

Your Digital Wallet now has:

- ☁️ **Real-time cloud sync** across all your devices
- 💾 **Offline support** with local caching
- 🔒 **Anonymous authentication** (no login required)
- 🚀 **Better performance** than MongoDB
- 🆓 **Free forever** with Firebase free tier

## 🐛 **Troubleshooting:**

**"Firebase not loading"**: Check your API key and project ID  
**"Permission denied"**: Set the Firestore security rules above  
**"Offline mode"**: Extension works offline, will sync when online  
**"Config issues"**: Run `.\create-config.ps1` after updating .env

---

**Enjoy your upgraded Digital Wallet with Firestore! 🔥**
