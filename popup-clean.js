// Digital Wallet - Clean Version with Firebase Integration
class DigitalWallet {
    constructor() {
        this.items = [];
        this.currentEditId = null;
        this.firestore = null;
        this.init();
    }

    async init() {
        console.log('Initializing Digital Wallet...');
        
        // Initialize Firebase service
        try {
            this.firestore = new FirestoreRestService();
            console.log('Firebase service created');
            
            // Set the correct user ID
            await this.setCorrectUserId();
            
            await this.firestore.init();
            console.log('Firebase init completed. Sync enabled:', this.firestore.syncEnabled);
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            this.firestore = null;
        }
        
        await this.loadItems();
        await this.initTheme();
        this.bindEvents();
        this.renderItems();
        console.log('Initialization complete');
    }

    async setCorrectUserId() {
        // Set your actual Firebase user ID
        const correctUserId = 'user_1755272169964_c2pgnbzwt';
        
        // Store it in Chrome storage
        await chrome.storage.local.set({ 'userFingerprint': correctUserId });
        console.log('Set correct user ID:', correctUserId);
    }

    bindEvents() {
        // Add item button
        document.getElementById('addItemBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openThemeModal();
        });

        // Modal form
        document.getElementById('itemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submitted, calling saveItem...');
            this.saveItem();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Theme modal close button
        document.getElementById('themeCloseBtn').addEventListener('click', () => {
            this.closeThemeModal();
        });

        // Close modal on outside click
        document.getElementById('itemModal').addEventListener('click', (e) => {
            if (e.target.id === 'itemModal') {
                this.closeModal();
            }
        });

        // Close theme modal on outside click
        document.getElementById('themeModal').addEventListener('click', (e) => {
            if (e.target.id === 'themeModal') {
                this.closeThemeModal();
            }
        });

        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.applyTheme(theme);
                this.closeThemeModal();
            });
        });
    }

    async loadItems() {
        console.log('Loading items...');
        try {
            if (this.firestore && this.firestore.syncEnabled) {
                // Load from Firebase
                console.log('Attempting to load from Firebase...');
                const items = await this.firestore.loadWalletItems();
                this.items = items || [];
                console.log('Successfully loaded items from Firebase:', this.items.length, 'items');
            } else {
                console.log('Firebase not available, using Chrome storage...');
                // Fallback to Chrome storage
                const result = await chrome.storage.local.get('digitalWalletItems');
                this.items = result.digitalWalletItems || [];
                console.log('Loaded items from Chrome storage:', this.items.length, 'items');
            }
        } catch (error) {
            console.error('Error loading items:', error);
            // Fallback to Chrome storage
            try {
                console.log('Falling back to Chrome storage...');
                const result = await chrome.storage.local.get('digitalWalletItems');
                this.items = result.digitalWalletItems || [];
                console.log('Fallback: Loaded items from Chrome storage:', this.items.length, 'items');
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                this.items = [];
            }
        }
    }

    async saveItems() {
        try {
            if (this.firestore && this.firestore.syncEnabled) {
                // Save to Firebase
                console.log('Saving items to Firebase...');
                await this.firestore.saveWalletItems(this.items);
            } else {
                // Fallback to Chrome storage
                console.log('Saving items to Chrome storage...');
                await chrome.storage.local.set({
                    digitalWalletItems: this.items
                });
            }
        } catch (error) {
            console.error('Error saving items:', error);
            // Always try to save to Chrome storage as backup
            try {
                await chrome.storage.local.set({
                    digitalWalletItems: this.items
                });
                console.log('Backup save to Chrome storage successful');
            } catch (backupError) {
                console.error('Backup save also failed:', backupError);
                this.showStatus('Error saving items', 'error');
            }
        }
    }

    renderItems() {
        const container = document.getElementById('itemsContainer');
        const emptyState = document.getElementById('emptyState');

        if (this.items.length === 0) {
            emptyState.style.display = 'block';
            container.innerHTML = '';
            container.appendChild(emptyState);
            return;
        }

        emptyState.style.display = 'none';
        container.innerHTML = '';

        this.items.forEach((item) => {
            const itemElement = this.createItemElement(item);
            container.appendChild(itemElement);
        });
    }

    createItemElement(item) {
        const div = document.createElement('div');
        div.className = 'item';
        
        div.innerHTML = `
            <div class="item-header">
                <div class="item-name">
                    <div class="item-icon-container">
                        <!-- Icon will be inserted here -->
                    </div>
                    <span class="item-text">${this.escapeHtml(item.name)}</span>
                </div>
                <div class="item-actions">
                    <button class="item-btn copy" data-id="${item.id}" title="Copy">
                        <img src="icons/button-icons/copy-alt.svg" alt="Copy">
                    </button>
                    <button class="item-btn edit" data-id="${item.id}" title="Edit">
                        <img src="icons/button-icons/file-edit.svg" alt="Edit">
                    </button>
                    <button class="item-btn delete" data-id="${item.id}" title="Delete">
                        <img src="icons/trash.svg" alt="Delete">
                    </button>
                </div>
            </div>
            <div class="item-value">${this.escapeHtml(item.value)}</div>
        `;

        // Set the icon after creating the element
        this.setItemIcon(div.querySelector('.item-icon-container'), item.value);

        // Bind item actions
        div.querySelector('.copy').addEventListener('click', () => this.copyItem(item.id));
        div.querySelector('.edit').addEventListener('click', () => this.editItem(item.id));
        div.querySelector('.delete').addEventListener('click', () => this.deleteItem(item.id));

        return div;
    }

    setItemIcon(container, value) {
        if (this.isValidUrl(value)) {
            // Try favicon first
            const img = document.createElement('img');
            img.className = 'item-favicon';
            img.src = this.getFaviconUrl(value);
            img.alt = 'icon';
            
            img.onload = () => {
                container.innerHTML = '';
                container.appendChild(img);
            };
            
            img.onerror = () => {
                // Fallback to emoji
                container.innerHTML = `<span class="item-emoji-fallback">${this.detectIcon(value)}</span>`;
            };
            
            // Set initial emoji while loading
            container.innerHTML = `<span class="item-emoji-fallback">${this.detectIcon(value)}</span>`;
        } else {
            // Just use emoji for non-URLs
            container.innerHTML = `<span class="item-emoji-fallback">${this.detectIcon(value)}</span>`;
        }
    }

    openModal(item = null) {
        const modal = document.getElementById('itemModal');
        const title = document.getElementById('modalTitle');
        const valueInput = document.getElementById('itemValue');

        if (item) {
            title.textContent = 'Edit Item';
            valueInput.value = item.value;
            this.currentEditId = item.id;
        } else {
            title.textContent = 'Add New Item';
            valueInput.value = '';
            this.currentEditId = null;
        }

        modal.classList.add('show');
        valueInput.focus();
    }

    closeModal() {
        const modal = document.getElementById('itemModal');
        modal.classList.remove('show');
        this.currentEditId = null;
    }

    async saveItem() {
        console.log('saveItem function called');
        const value = document.getElementById('itemValue').value.trim();
        console.log('Input value:', value);

        if (!value) {
            this.showStatus('Please enter a value', 'error');
            return;
        }

        console.log('Generating name for value:', value);
        // Auto-generate name based on URL or use the value itself
        const name = await this.generateItemName(value);
        console.log('Generated name:', name);

        if (this.currentEditId) {
            // Edit existing item
            const itemIndex = this.items.findIndex(item => item.id === this.currentEditId);
            if (itemIndex !== -1) {
                this.items[itemIndex] = {
                    ...this.items[itemIndex],
                    name,
                    value,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Add new item - use the same format as Firebase version
            const newItem = {
                id: this.generateId(),
                name,
                value,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Add Firebase-compatible fields
                icon: this.detectIcon(value),
                category: 'general'
            };
            this.items.push(newItem);
        }

        await this.saveItems();
        this.renderItems();
        this.closeModal();
        this.showStatus(this.currentEditId ? 'Item updated!' : 'Item added!', 'success');
    }

    async generateItemName(value) {
        // If it's a URL, try to extract domain name (skip title fetching for now)
        if (this.isValidUrl(value)) {
            try {
                const url = value.startsWith('http') ? value : `https://${value}`;
                const domain = new URL(url).hostname;
                const siteName = domain.replace('www.', '').split('.')[0];
                return siteName.charAt(0).toUpperCase() + siteName.slice(1); // Capitalize first letter
            } catch (error) {
                console.error('Failed to extract domain:', error);
            }
        }
        
        // For non-URLs, use the value itself (truncated if too long)
        return value.length > 30 ? value.substring(0, 30) + '...' : value;
    }

    async copyItem(id) {
        const item = this.items.find(item => item.id === id);
        if (!item) return;

        try {
            await navigator.clipboard.writeText(item.value);
            this.showStatus('Copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showStatus('Failed to copy', 'error');
        }
    }

    editItem(id) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            this.openModal(item);
        }
    }

    async deleteItem(id) {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }

        this.items = this.items.filter(item => item.id !== id);
        await this.saveItems();
        this.renderItems();
        this.showStatus('Item deleted!', 'success');
    }

    showStatus(message, type = 'success') {
        // Remove existing status messages
        const existingStatus = document.querySelector('.status-message');
        if (existingStatus) {
            existingStatus.remove();
        }

        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message ${type}`;
        statusDiv.textContent = message;
        document.body.appendChild(statusDiv);

        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 3000);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    isValidUrl(value) {
        try {
            // Check if it's a proper URL with http/https
            if (value.startsWith('http://') || value.startsWith('https://')) {
                new URL(value);
                return true;
            }
            // Check if it looks like a domain (has a dot and valid domain pattern)
            if (value.includes('.') && /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/.test(value.split('/')[0])) {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    getFaviconUrl(url) {
        try {
            // Extract domain from URL
            let domain;
            if (url.startsWith('http://') || url.startsWith('https://')) {
                domain = new URL(url).hostname;
            } else if (url.includes('.')) {
                // Handle cases like "github.com" without protocol
                domain = url.split('/')[0];
            } else {
                // Not a URL, return fallback
                return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><text y="12" font-size="12">📄</text></svg>';
            }
            
            // Use Google's favicon service (most reliable)
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch (error) {
            console.error('Error extracting domain:', error);
            return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><text y="12" font-size="12">🌐</text></svg>';
        }
    }

    detectIcon(value) {
        // Enhanced icon detection based on URL patterns
        const url = value.toLowerCase();
        
        if (url.includes('github.com')) return '🐙';
        if (url.includes('x.com') || url.includes('twitter.com')) return '🐦';
        if (url.includes('linkedin.com')) return '�';
        if (url.includes('instagram.com')) return '📷';
        if (url.includes('facebook.com')) return '📘';
        if (url.includes('youtube.com')) return '📺';
        if (url.includes('netflix.com')) return '🎬';
        if (url.includes('amazon.com')) return '📦';
        if (url.includes('google.com')) return '🔍';
        if (url.includes('paypal.com')) return '�';
        if (url.includes('discord.com')) return '🎮';
        if (url.includes('slack.com')) return '💬';
        if (url.includes('whatsapp.com')) return '💚';
        if (url.includes('telegram.org')) return '✈️';
        if (url.includes('reddit.com')) return '🤖';
        if (url.includes('stackoverflow.com')) return '🔧';
        if (url.includes('medium.com')) return '�';
        if (url.includes('notion.so')) return '📄';
        if (url.includes('figma.com')) return '🎨';
        if (url.includes('dribbble.com')) return '🏀';
        if (url.includes('behance.net')) return '🎭';
        if (url.includes('spotify.com')) return '�';
        if (url.includes('apple.com')) return '🍎';
        if (url.includes('microsoft.com')) return '🪟';
        if (url.includes('dropbox.com')) return '📦';
        if (url.includes('drive.google.com')) return '�';
        if (url.includes('zoom.us')) return '📹';
        if (url.includes('mailto:') || url.includes('@')) return '📧';
        if (url.startsWith('http')) return '🌐';
        if (url.includes('password') || url.includes('pwd')) return '🔒';
        return '📄';
    }

    // Theme Management
    openThemeModal() {
        const modal = document.getElementById('themeModal');
        modal.classList.add('show');
        this.loadCurrentTheme();
    }

    closeThemeModal() {
        const modal = document.getElementById('themeModal');
        modal.classList.remove('show');
    }

    async loadCurrentTheme() {
        try {
            const result = await chrome.storage.local.get('selectedTheme');
            const currentTheme = result.selectedTheme || 'charcoal-mocha';
            
            // Update active theme indicator
            document.querySelectorAll('.theme-option').forEach(option => {
                option.classList.remove('active');
                if (option.dataset.theme === currentTheme) {
                    option.classList.add('active');
                }
            });
        } catch (error) {
            console.error('Error loading current theme:', error);
        }
    }

    async applyTheme(theme) {
        const themes = {
            // Dark Mode Palettes
            'charcoal-mocha': {
                background: 'linear-gradient(135deg, #1C1A19 0%, #3B322D 25%, #6F5C4B 50%, #B8A897 75%, #E3DCD4 100%)',
                textColor: '#E3DCD4'
            },
            'midnight-copper': {
                background: 'linear-gradient(135deg, #181716 0%, #322D2B 25%, #6D4C41 50%, #A48F7B 75%, #D8C7B3 100%)',
                textColor: '#D8C7B3'
            },
            'smoky-forest': {
                background: 'linear-gradient(135deg, #121715 0%, #28302B 25%, #4C5C50 50%, #8D998F 75%, #D1D5CF 100%)',
                textColor: '#D1D5CF'
            },
            'velvet-plum': {
                background: 'linear-gradient(135deg, #181419 0%, #352833 25%, #5C4B5C 50%, #9B8A9D 75%, #D6CBD4 100%)',
                textColor: '#D6CBD4'
            },
            'slate-espresso': {
                background: 'linear-gradient(135deg, #1E1E1E 0%, #2D2B2B 25%, #4F463F 50%, #8F8175 75%, #D6CFC8 100%)',
                textColor: '#D6CFC8'
            },
            'ash-bronze': {
                background: 'linear-gradient(135deg, #181A1B 0%, #2F302E 25%, #5E5349 50%, #A6988A 75%, #D9D2C8 100%)',
                textColor: '#D9D2C8'
            },
            // Light Mode Palettes
            'soft-linen': {
                background: 'linear-gradient(135deg, #5B5046 0%, #9E8E80 25%, #CBBBA9 50%, #EAE5DE 75%, #FAF9F7 100%)',
                textColor: '#5B5046'
            },
            'nordic-sand': {
                background: 'linear-gradient(135deg, #645E55 0%, #A8A093 25%, #CDC3B8 50%, #EEEAE6 75%, #FDFCFB 100%)',
                textColor: '#645E55'
            },
            'clay-cream': {
                background: 'linear-gradient(135deg, #5E4B3E 0%, #A08B79 25%, #D9C5B4 50%, #F0E8E0 75%, #FEFBF8 100%)',
                textColor: '#5E4B3E'
            },
            'modern-sage': {
                background: 'linear-gradient(135deg, #4D4A44 0%, #8D8A82 25%, #C9C1B7 50%, #EBE6E0 75%, #FBFAF7 100%)',
                textColor: '#4D4A44'
            },
            'ivory-blush': {
                background: 'linear-gradient(135deg, #5C514C 0%, #A4938A 25%, #E1CFC6 50%, #F8F2EE 75%, #FFFDFB 100%)',
                textColor: '#5C514C'
            },
            'warm-minimal': {
                background: 'linear-gradient(135deg, #6A5F57 0%, #B4A89F 25%, #DDD6CF 50%, #F5F3F0 75%, #FFFFFF 100%)',
                textColor: '#6A5F57'
            }
        };

        const selectedTheme = themes[theme];
        if (selectedTheme) {
            // Apply the theme
            document.body.style.background = selectedTheme.background;
            document.body.style.backgroundSize = '400% 400%';
            document.body.style.color = selectedTheme.textColor;
            
            // Save theme preference
            await chrome.storage.local.set({ 'selectedTheme': theme });
            console.log('Theme applied:', theme);
            
            const themeName = theme.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            this.showStatus(`${themeName} theme applied!`, 'success');
        }
    }

    async initTheme() {
        try {
            const result = await chrome.storage.local.get('selectedTheme');
            const savedTheme = result.selectedTheme || 'charcoal-mocha';
            await this.applyTheme(savedTheme);
        } catch (error) {
            console.error('Error initializing theme:', error);
            // Default to charcoal mocha theme
            await this.applyTheme('charcoal-mocha');
        }
    }
}

// Initialize the wallet when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting Digital Wallet...');
    new DigitalWallet();
});
