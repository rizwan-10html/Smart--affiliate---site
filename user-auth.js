// SmartDeals Pro User Authentication & Notification System

class SmartDealsAuth {
  constructor() {
    this.currentUser = null;
    this.init();
    this.observeUserMenu(); // Add observer for user menu
  }

  init() {
    console.log('SmartDealsAuth init() called');
    this.loadCurrentUser();
    this.updateHeaderUI();
    this.setupNotifications();
    this.checkDailyNotifications();
    console.log('SmartDealsAuth init() completed');
  }

  loadCurrentUser() {
    const userData = localStorage.getItem('smartdeals_currentUser');
    console.log('Loading current user from localStorage:', !!userData);
    
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
        console.log('Current user loaded:', this.currentUser.name, this.currentUser.email);
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
        localStorage.removeItem('smartdeals_currentUser');
        this.currentUser = null;
      }
    } else {
      console.log('No current user found in localStorage');
      this.currentUser = null;
    }
  }

  updateHeaderUI() {
    const signInLink = document.querySelector('a[href="sign-in.html"]');
    if (!signInLink) {
      console.log('Sign-in link not found');
      return;
    }
    
    // Remove any existing user menu first
    const existingUserMenu = document.querySelector('.user-menu');
    if (existingUserMenu) {
      existingUserMenu.remove();
    }

    if (this.currentUser) {
      console.log('Updating header UI for user:', this.currentUser.name);
      
      // User is logged in - show user menu
      const userMenuHTML = `
        <div class="user-menu">
          <button class="user-menu-toggle" id="userMenuToggle">
            <i class="fas fa-user"></i>
            <span>${this.currentUser.name}</span>
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="user-menu-dropdown" id="userMenuDropdown">
            <button class="user-menu-close" id="userMenuClose" aria-label="Close user menu" tabindex="0">
              <i class="fas fa-times"></i>
            </button>
            <div class="user-info">
              <h4>${this.currentUser.name}</h4>
              <p>${this.currentUser.email}</p>
            </div>
            <div class="user-menu-divider"></div>
            <a href="#" onclick="showUserProfile()">
              <i class="fas fa-user-circle"></i> My Profile
            </a>
            <a href="#" onclick="showNotificationSettings()">
              <i class="fas fa-bell"></i> Notifications
            </a>
            <a href="#" onclick="showUserPreferences()">
              <i class="fas fa-cog"></i> Settings
            </a>
            <div class="user-menu-divider"></div>
            <a href="#" onclick="signOut()" class="sign-out">
              <i class="fas fa-sign-out-alt"></i> Sign Out
            </a>
          </div>
        </div>
      `;
      
      signInLink.outerHTML = userMenuHTML;
      
      // Add event listener to the toggle button with multiple approaches
      setTimeout(() => {
        this.attachUserMenuEvents();
      }, 100);
      
      // Also try immediately
      this.attachUserMenuEvents();
    } else {
      console.log('No current user, keeping sign-in link');
    }
  }

  attachUserMenuEvents() {
    const toggleButton = document.getElementById('userMenuToggle');
    const dropdown = document.getElementById('userMenuDropdown');
    
    console.log('Attaching events - Toggle button:', !!toggleButton, 'Dropdown:', !!dropdown);
    
    if (toggleButton && !toggleButton.hasAttribute('data-listener-attached')) {
      console.log('Adding click listener to user menu toggle');
      
      // Mark as having listener to avoid duplicates
      toggleButton.setAttribute('data-listener-attached', 'true');
      
      toggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('User menu toggle clicked');
        this.toggleUserMenu();
      });
    }
    
    // Alternative approach - direct onclick
    if (toggleButton && !toggleButton.onclick) {
      toggleButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('User menu toggle clicked via onclick');
        this.toggleUserMenu();
      };
    }

    // Add close button event
    const closeButton = document.getElementById('userMenuClose');
    if (closeButton && !closeButton.hasAttribute('data-listener-attached')) {
      closeButton.setAttribute('data-listener-attached', 'true');
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeUserMenu();
      });
      // Keyboard accessibility
      closeButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.closeUserMenu();
        }
      });
    }

    // Close menu when clicking outside
    document.addEventListener('mousedown', this._userMenuOutsideHandler = (e) => {
      const dropdown = document.getElementById('userMenuDropdown');
      if (dropdown && dropdown.classList.contains('active') && !dropdown.contains(e.target) && !toggleButton.contains(e.target)) {
        this.closeUserMenu();
      }
    });
  }

  toggleUserMenu() {
    console.log('toggleUserMenu called');
    
    const dropdown = document.getElementById('userMenuDropdown');
    console.log('Dropdown element found:', !!dropdown);
    
    if (dropdown) {
      const wasActive = dropdown.classList.contains('active');
      dropdown.classList.toggle('active');
      const isActive = dropdown.classList.contains('active');
      console.log('Menu toggled from', wasActive, 'to', isActive);
    } else {
      console.log('Trying fallback selector');
      // Try fallback
      const dropdownByClass = document.querySelector('.user-menu-dropdown');
      console.log('Fallback dropdown found:', !!dropdownByClass);
      
      if (dropdownByClass) {
        const wasActive = dropdownByClass.classList.contains('active');
        dropdownByClass.classList.toggle('active');
        const isActive = dropdownByClass.classList.contains('active');
        console.log('Fallback menu toggled from', wasActive, 'to', isActive);
      }
    }
  }

  closeUserMenu() {
    const dropdown = document.getElementById('userMenuDropdown');
    if (dropdown) {
      dropdown.classList.remove('active');
    }
  }

  signOut() {
    if (confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('smartdeals_currentUser');
      this.currentUser = null;
      window.location.reload();
    }
  }

  // Notification System
  setupNotifications() {
    if (!this.currentUser || !this.currentUser.notificationConsent) {
      return;
    }

    // Request notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }

  checkDailyNotifications() {
    if (!this.currentUser || !this.currentUser.notificationConsent) {
      return;
    }

    const lastNotification = this.currentUser.lastNotification;
    const today = new Date().toDateString();
    const lastNotificationDate = lastNotification ? new Date(lastNotification).toDateString() : null;

    if (lastNotificationDate !== today) {
      this.sendDailyNotification();
      this.updateLastNotification();
    }
  }

  sendDailyNotification() {
    const products = this.getRandomProducts();
    const message = `🎉 Hi ${this.currentUser.name}! Check out today's featured deals: ${products.join(', ')}`;

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SmartDeals Pro - Daily Deals', {
        body: message,
        icon: '/logo.png',
        tag: 'daily-deals'
      });
    }

    // In-app notification
    this.showInAppNotification(message);
    
    // Store notification history
    this.storeNotificationHistory(message);
  }

  getRandomProducts() {
    const productCategories = [
      'New Smartwatches',
      'Gaming Accessories',
      'Fashion Deals',
      'Electronics',
      'Home & Garden',
      'Tech Gadgets'
    ];
    
    const shuffled = productCategories.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  showInAppNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'in-app-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-bell"></i>
        <p>${message}</p>
        <button onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  updateLastNotification() {
    if (!this.currentUser) return;

    this.currentUser.lastNotification = new Date().toISOString();
    localStorage.setItem('smartdeals_currentUser', JSON.stringify(this.currentUser));

    // Update in users array
    const users = JSON.parse(localStorage.getItem('smartdeals_users') || '[]');
    const userIndex = users.findIndex(u => u.id === this.currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = this.currentUser;
      localStorage.setItem('smartdeals_users', JSON.stringify(users));
    }
  }

  storeNotificationHistory(message) {
    const history = JSON.parse(localStorage.getItem('smartdeals_notifications') || '[]');
    history.unshift({
      id: Date.now(),
      userId: this.currentUser.id,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
    
    // Keep only last 50 notifications
    if (history.length > 50) {
      history.splice(50);
    }
    
    localStorage.setItem('smartdeals_notifications', JSON.stringify(history));
  }

  getNotificationHistory() {
    const history = JSON.parse(localStorage.getItem('smartdeals_notifications') || '[]');
    return history.filter(n => n.userId === this.currentUser?.id);
  }

  // User Profile Management
  showUserProfile() {
    const modal = this.createModal('User Profile', `
      <div class="profile-form">
        <div class="form-group">
          <label>Name</label>
          <input type="text" id="profileName" value="${this.currentUser.name}">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="profileEmail" value="${this.currentUser.email}">
        </div>
        <div class="form-group">
          <label>Member Since</label>
          <input type="text" value="${new Date(this.currentUser.joinDate).toLocaleDateString()}" disabled>
        </div>
        <div class="form-group">
          <label>Last Login</label>
          <input type="text" value="${new Date(this.currentUser.lastLogin).toLocaleDateString()}" disabled>
        </div>
        <div class="form-actions">
          <button onclick="updateProfile()" class="btn btn-primary">Update Profile</button>
          <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    `);
  }

  showNotificationSettings() {
    const modal = this.createModal('Notification Settings', `
      <div class="notification-settings">
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="notificationConsent" ${this.currentUser.notificationConsent ? 'checked' : ''}>
            Receive daily product notifications
          </label>
        </div>
        <div class="form-group">
          <label>Notification History</label>
          <div class="notification-history" id="notificationHistory">
            ${this.renderNotificationHistory()}
          </div>
        </div>
        <div class="form-actions">
          <button onclick="updateNotificationSettings()" class="btn btn-primary">Save Settings</button>
          <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    `);
  }

  renderNotificationHistory() {
    const history = this.getNotificationHistory();
    if (history.length === 0) {
      return '<p>No notifications yet.</p>';
    }
    
    return history.slice(0, 10).map(notification => `
      <div class="notification-item">
        <p>${notification.message}</p>
        <small>${new Date(notification.timestamp).toLocaleString()}</small>
      </div>
    `).join('');
  }

  createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'user-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="closeModal()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button onclick="closeModal()" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
  }

  updateProfile() {
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    
    if (!name || !email) {
      alert('Please fill in all fields');
      return;
    }
    
    this.currentUser.name = name;
    this.currentUser.email = email;
    
    localStorage.setItem('smartdeals_currentUser', JSON.stringify(this.currentUser));
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('smartdeals_users') || '[]');
    const userIndex = users.findIndex(u => u.id === this.currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = this.currentUser;
      localStorage.setItem('smartdeals_users', JSON.stringify(users));
    }
    
    this.updateHeaderUI();
    this.closeModal();
    alert('Profile updated successfully!');
  }

  updateNotificationSettings() {
    const consent = document.getElementById('notificationConsent').checked;
    
    this.currentUser.notificationConsent = consent;
    
    localStorage.setItem('smartdeals_currentUser', JSON.stringify(this.currentUser));
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('smartdeals_users') || '[]');
    const userIndex = users.findIndex(u => u.id === this.currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = this.currentUser;
      localStorage.setItem('smartdeals_users', JSON.stringify(users));
    }
    
    this.closeModal();
    alert('Notification settings updated successfully!');
  }

  closeModal() {
    const modal = document.querySelector('.user-modal');
    if (modal) {
      modal.remove();
    }
  }

  observeUserMenu() {
    // MutationObserver to watch for user menu injection
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;
    const observer = new MutationObserver(() => {
      this.attachUserMenuEvents();
    });
    observer.observe(headerRight, { childList: true, subtree: true });
  }
}

// Global functions for UI interactions
function toggleUserMenu() {
  if (window.smartDealsAuth) {
    window.smartDealsAuth.toggleUserMenu();
  }
}

function showUserProfile() {
  window.smartDealsAuth.showUserProfile();
}

function showNotificationSettings() {
  window.smartDealsAuth.showNotificationSettings();
}

function showUserPreferences() {
  alert('User preferences feature coming soon!');
}

function signOut() {
  window.smartDealsAuth.signOut();
}

function updateProfile() {
  window.smartDealsAuth.updateProfile();
}

function updateNotificationSettings() {
  window.smartDealsAuth.updateNotificationSettings();
}

function closeModal() {
  window.smartDealsAuth.closeModal();
}

// Initialize the authentication system
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing SmartDealsAuth');
  window.smartDealsAuth = new SmartDealsAuth();
  console.log('SmartDealsAuth initialized:', !!window.smartDealsAuth);
});

// Global event delegation for user menu toggle (fallback)
document.addEventListener('click', function(e) {
  const userMenuToggle = e.target.closest('.user-menu-toggle');
  if (userMenuToggle) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Global click handler - user menu toggle clicked');
    
    if (window.smartDealsAuth) {
      window.smartDealsAuth.toggleUserMenu();
    } else {
      console.log('smartDealsAuth not available in global handler');
    }
  }
});

// Close user menu when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.user-menu')) {
    const dropdown = document.getElementById('userMenuDropdown');
    if (dropdown && dropdown.classList.contains('active')) {
      console.log('Closing user menu - clicked outside');
      dropdown.classList.remove('active');
    }
    
    // Also try fallback
    const dropdownByClass = document.querySelector('.user-menu-dropdown.active');
    if (dropdownByClass) {
      console.log('Closing user menu (fallback) - clicked outside');
      dropdownByClass.classList.remove('active');
    }
  }
});