 document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    // Debounce function to limit API calls
    function debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
    
    // Fetch search results
    const fetchResults = debounce(async (query) => {
      if (query.length < 2) {
        searchResults.style.display = 'none';
        return;
      }
      
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const products = await response.json();
        
        if (products.length > 0) {
          searchResults.innerHTML = products.map(product => `
            <div class="product-card" onclick="window.location.href='/products/${product.id}'">
              <img src="${product.image || '/images/placeholder.jpg'}" alt="${product.name}">
              <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
              </div>
            </div>
          `).join('');
          searchResults.style.display = 'block';
        } else {
          searchResults.innerHTML = '<div class="no-results">No products found</div>';
          searchResults.style.display = 'block';
        }
      } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = '<div class="no-results">Error loading results</div>';
        searchResults.style.display = 'block';
      }
    }, 300);
    
    // Event listeners
    searchInput.addEventListener('input', (e) => {
      fetchResults(e.target.value.trim());
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchContainer.contains(e.target)) {
        searchResults.style.display = 'none';
      }
    });
    
    // Hide results on escape key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchResults.style.display = 'none';
      }
    });
  });