// // Enhanced Cart Functions
// const Cart = {
//   // Remove item from cart
//   async removeItem(productId) {
//     try {
//       const response = await fetch("/cart/remove", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ productId }),
//       });

//       if (response.ok) {
//         // Remove the item from DOM without full page reload
//         const itemElement = document
//           .querySelector(
//             `.cart-item input[name="productId"][value="${productId}"]`
//           )
//           ?.closest(".cart-item");
//         if (itemElement) {
//           itemElement.remove();
//         }

//         // Update cart summary
//         await this.updateCartSummary();
//       } else {
//         console.error("Failed to remove item");
//         alert("Failed to remove item. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       alert("An error occurred. Please try again.");
//     }
//   },

//   // Update item quantity
//   async updateQuantity(productId, action) {
//     try {
//       const quantityElement = document.getElementById(`quantity-${productId}`);
//       if (!quantityElement) return;

//       // Show loading state
//       quantityElement.style.opacity = "0.5";
//       const originalQuantity = parseInt(quantityElement.textContent);

//       const response = await fetch("/cart/update", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ productId, action }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // Update the quantity display
//         let newQuantity = originalQuantity;
//         if (action === "increase") {
//           newQuantity++;
//         } else if (action === "decrease") {
//           newQuantity = Math.max(1, newQuantity - 1);
//         }
//         quantityElement.textContent = newQuantity;

//         // Update cart summary
//         await this.updateCartSummary();
//       } else {
//         console.error("Failed to update quantity:", data.message);
//         // Revert to original quantity if update failed
//         quantityElement.textContent = originalQuantity;
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       // Remove loading state
//       if (quantityElement) {
//         quantityElement.style.opacity = "1";
//       }
//     }
//   },

//   // Update cart summary (subtotal, total, item count)
//   async updateCartSummary() {
//     try {
//       const response = await fetch("/cart/summary");
//       if (!response.ok) throw new Error("Failed to get cart summary");

//       const data = await response.json();

//       // Update cart count in header
//       if (data.cartItemCount !== undefined) {
//         document.querySelectorAll(".cart-count").forEach((el) => {
//           el.textContent = `(${data.cartItemCount})`;
//         });
//       }

//       // Update order summary section
//       if (data.orderSummary) {
//         const { itemCount, subtotal, total } = data.orderSummary;

//         // Update subtotal items count
//         const subtotalItemsElement = document.querySelector(
//           ".summary-row:first-child span:first-child"
//         );
//         if (subtotalItemsElement) {
//           subtotalItemsElement.textContent = `Subtotal (${itemCount} items)`;
//         }

//         // Update subtotal price
//         const subtotalPriceElement = document.querySelector(
//           ".summary-row:first-child span:last-child"
//         );
//         if (subtotalPriceElement) {
//           subtotalPriceElement.textContent = `₹${subtotal.toFixed(2)}`;
//         }

//         // Update total price
//         const totalPriceElement = document.querySelector(
//           ".summary-total span:last-child"
//         );
//         if (totalPriceElement) {
//           totalPriceElement.textContent = `₹${total.toFixed(2)}`;
//         }
//       }

//       // If cart is empty, show empty cart message
//       if (data.cartItemCount === 0) {
//         this.showEmptyCart();
//       }
//     } catch (error) {
//       console.error("Error updating cart summary:", error);
//     }
//   },

//   // Show empty cart message
//   showEmptyCart() {
//     const cartContainer = document.querySelector(".cart-container");
//     if (cartContainer) {
//       cartContainer.innerHTML = `
//         <div class="empty-cart">
//           <h2>Your cart is empty</h2>
//           <p>Looks like you haven't added anything to your cart yet.</p>
//           <a href="/women" class="shop-btn">Continue Shopping</a>
//         </div>
//       `;
//     }
//   },
// };

// // Event Delegation for Cart Actions
// document.addEventListener("click", function (e) {
//   // Handle remove button clicks
//   if (e.target.closest(".remove-btn")) {
//     e.preventDefault();
//     const form = e.target.closest("form");
//     const productId = form.querySelector("[name='productId']").value;
//     if (productId) {
//       Cart.removeItem(productId);
//     }
//   }

//   // Handle quantity increase
//   if (e.target.closest(".quantity-btn") && e.target.textContent === "+") {
//     e.preventDefault();
//     const productId = e.target
//       .closest(".cart-item")
//       .querySelector("[name='productId']").value;
//     if (productId) {
//       Cart.updateQuantity(productId, "increase");
//     }
//   }

//   // Handle quantity decrease
//   if (e.target.closest(".quantity-btn") && e.target.textContent === "-") {
//     e.preventDefault();
//     const productId = e.target
//       .closest(".cart-item")
//       .querySelector("[name='productId']").value;
//     if (productId) {
//       Cart.updateQuantity(productId, "decrease");
//     }
//   }
// });

// // Initialize cart summary on page load
// document.addEventListener("DOMContentLoaded", function () {
//   // Add data-product-id attributes to all cart items if not already present
//   document.querySelectorAll(".cart-item").forEach((item) => {
//     const productId = item.querySelector("[name='productId']")?.value;
//     if (productId) {
//       item.setAttribute("data-product-id", productId);
//     }
//   });
// });

document.addEventListener("DOMContentLoaded", function () {
  // Handle quantity increase
  document.querySelectorAll(".increase-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id");
      updateQuantity(productId, "increase");
    });
  });

  // Handle quantity decrease
  document.querySelectorAll(".decrease-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id");
      updateQuantity(productId, "decrease");
    });
  });

  // Handle remove item
  document.querySelectorAll(".remove-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-product-id");
      removeFromCart(productId);
    });
  });
});

async function updateQuantity(productId, action) {
  try {
    const quantityElement = document.getElementById(`quantity-${productId}`);
    if (!quantityElement) return;

    // Show loading state
    quantityElement.style.opacity = "0.5";
    const originalQuantity = parseInt(quantityElement.textContent);

    const response = await fetch("/cart/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, action }),
    });

    if (response.ok) {
      // Update the quantity display
      let newQuantity = originalQuantity;
      if (action === "increase") {
        newQuantity++;
      } else if (action === "decrease") {
        newQuantity = Math.max(1, newQuantity - 1);
      }
      quantityElement.textContent = newQuantity;

      // Reload the page to update totals (simple solution)
      window.location.reload();
    } else {
      console.error("Failed to update quantity");
      quantityElement.textContent = originalQuantity;
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Remove loading state
    if (quantityElement) {
      quantityElement.style.opacity = "1";
    }
  }
}

async function removeFromCart(productId) {
  try {
    const response = await fetch("/cart/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });

    if (response.ok) {
      // Reload the page to see changes
      window.location.reload();
    } else {
      console.error("Failed to remove item");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
