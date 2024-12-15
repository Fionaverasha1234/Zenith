// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Zenith/sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(err => {
        console.log('Service Worker registration failed:', err);
      });
  });
}

// Cache Configuration
const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

// DOM Elements
const cartItems = document.getElementById('cart-items');
const totalPriceElement = document.getElementById('total-price');
const saveFavouritesButton = document.getElementById('save-favourites');
const applyFavouritesButton = document.getElementById('apply-favourites');
const buyNowButton = document.getElementById('buy-now');

let cart = [];
let favourites = [];

// Utility: Calculate total price
function calculateTotal() {
  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  totalPriceElement.textContent = `Total Price: $${total.toFixed(2)}`;
}

// Utility: Update cart table
function updateCartTable() {
  cartItems.innerHTML = '';
  cart.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.price}</td>
      <td>$${(item.quantity * item.price).toFixed(2)}</td>
    `;
    cartItems.appendChild(row);
  });
  calculateTotal();
}

// Fetch Medicines and Populate the UI
async function loadMedicines() {
  try {
    const response = await fetch('medicine.json');
    const data = await response.json();

    data.categories.forEach(category => {
      const sectionList = document.getElementById(
        `${category.name.toLowerCase()}-list`.replace(/\s/g, '')
      );

      if (sectionList) {
        category.items.forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.classList.add('item');

          itemDiv.innerHTML = `
            <label for="${item.id}">${item.name}</label>
            <input type="number" min="0" class="quantity" id="${item.id}">
            <button class="add-to-cart" data-name="${item.name}" data-price="${item.price}">
              Add to Cart
            </button>
          `;

          sectionList.appendChild(itemDiv);
        });
      }
    });

    // Attach event listeners to Add to Cart buttons after DOM update
    attachAddToCartListeners();
  } catch (error) {
    console.error('Error loading medicines:', error);
  }
}

// Attach Add to Cart Event Listeners
function attachAddToCartListeners() {
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const name = button.getAttribute('data-name');
      const price = parseFloat(button.getAttribute('data-price'));
      const quantityInput = button.previousElementSibling;
      const quantity = parseInt(quantityInput.value, 10);

      if (!quantity || quantity <= 0) {
        alert('Please enter a valid quantity.');
        return;
      }

      const existingItem = cart.find(item => item.name === name);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({ name, price, quantity });
      }

      quantityInput.value = ''; // Clear the input field
      updateCartTable();
    });
  });
}

// Save Favourites
saveFavouritesButton.addEventListener('click', () => {
  favourites = [...cart];
  alert('Your favourites have been saved!');
});

// Apply Favourites
applyFavouritesButton.addEventListener('click', () => {
  if (favourites.length === 0) {
    alert('No favourites saved.');
    return;
  }

  favourites.forEach(favItem => {
    const existingItem = cart.find(item => item.name === favItem.name);
    if (existingItem) {
      existingItem.quantity += favItem.quantity;
    } else {
      cart.push({ ...favItem });
    }
  });

  updateCartTable();
  alert('Favourites have been applied to the cart!');
});

// Buy Now
buyNowButton.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  alert('Purchase successful! Thank you for your order.');
  cart = []; // Clear cart
  updateCartTable();
  window.location.href = 'payment.html';
});

// Initialize Application
document.addEventListener('DOMContentLoaded', loadMedicines);
