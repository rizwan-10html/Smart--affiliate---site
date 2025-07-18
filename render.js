// Enhanced Product Rendering System for SmartDeals Pro

// Main function to render products with enhanced features
function renderProducts(filterCategory = null, containerId = 'product-container') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.log(`Container with ID "${containerId}" not found`);
    return;
  }
  
  container.innerHTML = "";

  // Ensure we have products array
  if (!window.products || window.products.length === 0) {
    console.log('Products array not available, showing loading state');
    container.innerHTML = `
      <div class="no-products">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #9ca3af; margin-bottom: 1rem;"></i>
        <h3>Loading products...</h3>
        <p>Getting the latest deals for you...</p>
        <div class="loading-progress">
          <div class="progress-bar" id="loadingProgress"></div>
        </div>
      </div>
    `;
    
    // Start progress animation
    animateLoadingProgress();
    return;
  }

  console.log(`Filtering products by category: ${filterCategory}`);
  console.log('Available products:', window.products.length);
  
  const filteredProducts = filterCategory
    ? window.products.filter(p => {
        console.log(`Product "${p.name}" has category: "${p.category}"`);
        return p.category === filterCategory;
      })
    : window.products;

  console.log(`Filtered products count: ${filteredProducts.length}`);

  if (filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="no-products">
        <i class="fas fa-search" style="font-size: 3rem; color: #9ca3af; margin-bottom: 1rem;"></i>
        <h3>No products found</h3>
        <p>No products available in this category yet. Try submitting a product or check back later!</p>
        <a href="product-submission.html" class="btn btn-primary" style="margin-top: 1rem;">Submit a Product</a>
      </div>
    `;
    return;
  }

  // Animate products appearing
  filteredProducts.forEach((product, index) => {
    const productCard = createProductCard(product);
    productCard.style.opacity = '0';
    productCard.style.transform = 'translateY(20px)';
    container.appendChild(productCard);
    
    // Stagger animation
    setTimeout(() => {
      productCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      productCard.style.opacity = '1';
      productCard.style.transform = 'translateY(0)';
    }, index * 50);
  });
  
  console.log(`Rendered ${filteredProducts.length} products in ${containerId}`);
}

// Function to animate loading progress
function animateLoadingProgress() {
  const progressBar = document.getElementById('loadingProgress');
  if (!progressBar) return;
  
  let width = 0;
  const interval = setInterval(() => {
    width += Math.random() * 10;
    if (width >= 90) {
      width = 90;
      clearInterval(interval);
    }
    progressBar.style.width = width + '%';
  }, 100);
}

// Function to create enhanced product card
function createProductCard(product) {
  const div = document.createElement("div");
  div.className = "product-card";
  
  // Add data attributes so existing filters on some pages work
  div.setAttribute('data-category', product.category || '');
  const numericPrice = parseFloat((product.price || '').toString().replace('$','')) || 0;
  div.setAttribute('data-price', numericPrice);
  
  const discountBadge = product.discount > 0 ? 
    `<div class="discount-badge">-${product.discount}%</div>` : '';
  
  const originalPrice = product.originalPrice && product.originalPrice !== product.price ? 
    `<span class="original-price">${product.originalPrice}</span>` : '';
  
  const stars = generateStars(product.rating);
  
  const features = product.features ? 
    product.features.slice(0, 3).map(feature => `<span class="feature-tag">${feature}</span>`).join('') : '';

  div.innerHTML = `
    ${discountBadge}
    <div class="product-image-container">
      <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
      <div class="product-overlay">
        <button class="quick-view-btn" onclick="showProductDetails(${product.id})">
          <i class="fas fa-eye"></i> Quick View
        </button>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-title">${product.name}</h3>
      <div class="product-rating">
        <div class="stars">${stars}</div>
        <span class="rating-text">${product.rating} (${product.reviews} reviews)</span>
      </div>
      <p class="product-description">${product.description}</p>
      <div class="product-features">
        ${features}
      </div>
      <div class="product-price">
        ${originalPrice}
        <span class="current-price">${product.price}</span>
      </div>
      <div class="product-buttons">
        <a href="${product.link}" target="_blank" class="btn btn-primary btn-small" onclick="trackClick('${product.name}', '${product.category}')">
          <i class="fas fa-shopping-cart"></i> Buy Now
        </a>
        <button class="btn btn-outline btn-small" onclick="addToWishlist(${product.id})">
          <i class="fas fa-heart"></i> Save
        </button>
      </div>
    </div>
  `;
  
  return div;
}

// Function to generate star ratings
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  let stars = '';
  
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  
  if (halfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }
  
  return stars;
}

// Function to render featured products on homepage
function renderFeaturedProducts() {
  const featuredProducts = getFeaturedProducts();
  const container = document.getElementById('featuredProductsGrid');
  
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!window.products || window.products.length === 0) {
    container.innerHTML = `
      <div class="no-products">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #9ca3af; margin-bottom: 1rem;"></i>
        <h3>Loading featured products...</h3>
      </div>
    `;
    return;
  }
  
  featuredProducts.forEach((product, index) => {
    const productCard = createProductCard(product);
    productCard.style.opacity = '0';
    productCard.style.transform = 'translateY(20px)';
    container.appendChild(productCard);
    
    setTimeout(() => {
      productCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      productCard.style.opacity = '1';
      productCard.style.transform = 'translateY(0)';
    }, index * 100);
  });
}

// Function to show product details in modal
function showProductDetails(productId) {
  const product = window.products.find(p => p.id === productId);
  if (!product) return;
  
  const modal = document.createElement('div');
  modal.className = 'product-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${product.name}</h2>
        <button class="close-modal" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="modal-info">
          <div class="product-rating">
            <div class="stars">${generateStars(product.rating)}</div>
            <span class="rating-text">${product.rating} (${product.reviews} reviews)</span>
          </div>
          <p class="product-description">${product.description}</p>
          <div class="product-features">
            <h4>Key Features:</h4>
            <ul>
              ${product.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          <div class="product-price">
            ${product.originalPrice && product.originalPrice !== product.price ? 
              `<span class="original-price">${product.originalPrice}</span>` : ''}
            <span class="current-price">${product.price}</span>
          </div>
          <div class="modal-buttons">
            <a href="${product.link}" target="_blank" class="btn btn-primary" onclick="trackClick('${product.name}', '${product.category}')">
              <i class="fas fa-shopping-cart"></i> Buy Now
            </a>
            <button class="btn btn-outline" onclick="addToWishlist(${product.id})">
              <i class="fas fa-heart"></i> Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

// Function to close modal
function closeModal() {
  const modal = document.querySelector('.product-modal');
  if (modal) {
    modal.remove();
  }
}

// Function to add product to wishlist
function addToWishlist(productId) {
  const product = window.products.find(p => p.id === productId);
  if (!product) return;
  
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    showNotification(`${product.name} added to wishlist!`, 'success');
  } else {
    showNotification(`${product.name} is already in your wishlist!`, 'info');
  }
}

// Function to show notifications
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Function to track clicks for analytics
function trackClick(productName, category) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'click', {
      event_category: 'Product',
      event_label: productName,
      custom_parameter: category
    });
  }
  
  console.log(`Product clicked: ${productName} in ${category}`);
}

// Function to search products
function searchProducts(query) {
  const searchTerm = query.toLowerCase();
  return window.products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.features.some(feature => feature.toLowerCase().includes(searchTerm)) ||
    product.category.toLowerCase().includes(searchTerm)
  );
}

// Function to render search results
function renderSearchResults(query) {
  const searchResults = searchProducts(query);
  const container = document.getElementById('searchResults') || document.getElementById('product-container');
  
  if (!container) return;
  
  container.innerHTML = '';
  
  if (searchResults.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search" style="font-size: 3rem; color: #9ca3af; margin-bottom: 1rem;"></i>
        <h3>No results found for "${query}"</h3>
        <p>Try different keywords or browse our categories.</p>
      </div>
    `;
    return;
  }
  
  searchResults.forEach(product => {
    const productCard = createProductCard(product);
    container.appendChild(productCard);
  });
}

// Auto-render products based on page URL
function autoRenderProducts() {
  const path = window.location.pathname;
  const filename = path.split('/').pop();
  
  console.log(`Auto-rendering for page: ${filename}`);
  console.log('Products available:', window.products ? window.products.length : 0);
  
  // Log all available categories for debugging
  if (window.products && window.products.length > 0) {
    const categories = [...new Set(window.products.map(p => p.category))];
    console.log('Available categories:', categories);
  }
  
  if (filename.includes('smartwatch')) {
    console.log('Rendering smartwatch products');
    renderProducts('smartwatch');
  } else if (filename.includes('fashion')) {
    console.log('Rendering fashion products');
    renderProducts('fashion');
  } else if (filename.includes('small-electrical') || filename.includes('electronic')) {
    console.log('Rendering electrical products');
    renderProducts('electrical');
  } else if (filename.includes('gaming')) {
    console.log('Rendering gaming products');
    renderProducts('gaming');
  } else if (filename.includes('home-garden')) {
    console.log('Rendering home-garden products');
    renderProducts('home-garden');
  } else if (filename.includes('index') || filename === '' || filename === '/') {
    console.log('Rendering featured products for homepage');
    // Homepage - render featured products
    if (document.getElementById('featuredProductsGrid')) {
      renderFeaturedProducts();
    }
  } else {
    console.log(`No specific rendering rule for page: ${filename}`);
  }
}

// Enhanced initialization with immediate rendering
function initializeRenderer() {
  console.log('Initializing renderer...');
  
  // Try to render immediately if products are available
  if (window.products && window.products.length > 0) {
    console.log('Products already available, rendering immediately');
    autoRenderProducts();
    return;
  }
  
  // Set up faster retry mechanism
  let retryCount = 0;
  const maxRetries = 30; // 15 seconds total
  const retryInterval = 200; // 200ms between retries - much faster
  
  const retryTimer = setInterval(() => {
    retryCount++;
    console.log(`Retry ${retryCount}/${maxRetries} - checking for products...`);
    
    if (window.products && window.products.length > 0) {
      console.log('Products found on retry, rendering...');
      clearInterval(retryTimer);
      autoRenderProducts();
    } else if (retryCount >= maxRetries) {
      console.log('Max retries reached, showing error state...');
      clearInterval(retryTimer);
      
      // Show helpful error message
      const container = document.getElementById('product-container') || document.getElementById('featuredProductsGrid');
      if (container) {
        container.innerHTML = `
          <div class="no-products">
            <i class="fas fa-wifi" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem;"></i>
            <h3>Connection Issue</h3>
            <p>Having trouble loading products. Please check your internet connection.</p>
            <button onclick="window.location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
              <i class="fas fa-redo"></i> Try Again
            </button>
          </div>
        `;
      }
    }
  }, retryInterval);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing renderer...');
  initializeRenderer();
  
  // Add search functionality
  const searchForm = document.querySelector('.search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const query = this.querySelector('input[type="search"]').value;
      if (query) {
        renderSearchResults(query);
      }
    });
  }
});

// Re-render automatically once the product catalogue finishes loading
document.addEventListener('products-ready', function () {
  console.log('Products ready event received, auto-rendering...');
  autoRenderProducts();
});

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderProducts,
    renderFeaturedProducts,
    createProductCard,
    showProductDetails,
    addToWishlist,
    trackClick,
    searchProducts,
    renderSearchResults
  };
}
