
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // Replace this with the client's real WhatsApp number.
  // Bangladesh country code included; do not use +, spaces, or dashes.
  const WHATSAPP_NUMBER = "8801700000000";

  const DEMO_NUMBER = "8801700000000";

  const menuToggle = document.querySelector(
    "#menuToggle, #menu-toggle, .menu-toggle, [aria-controls='navLinks'], [aria-controls='nav-links']"
  );

  const navLinks = document.querySelector(
    "#navLinks, #nav-links, .nav-links"
  );

  const orderDialog = document.querySelector(
    "#orderDialog, #order-dialog, dialog"
  );

  const orderForm = document.querySelector(
    "#orderForm, #order-form, dialog form"
  );

  const closeOrderButton = document.querySelector(
    "#closeOrder, #close-order, .close-order, [data-close-order]"
  );

  const nameInput = document.querySelector(
    "#customerName, #name, #nameInput, input[name='name']"
  );

  const phoneInput = document.querySelector(
    "#customerPhone, #phone, #phoneInput, input[name='phone']"
  );

  const quantityInput = document.querySelector(
    "#quantity, #quantityInput, input[name='quantity']"
  );

  const productNameInput = document.querySelector(
    "#productName, input[name='productName']"
  );

  const productPriceInput = document.querySelector(
    "#productPrice, input[name='productPrice']"
  );

  const totalElement = document.querySelector(
    "#orderTotal, #totalPrice, .order-total, [data-order-total]"
  );

  const toast = document.querySelector("#toast, .toast");

  let selectedProduct = "Classic Espresso";
  let selectedPrice = 180;
  let previousFocus = null;

  // Keep the menu usable on mobile and update accessibility state.
  if (menuToggle && navLinks) {
    menuToggle.setAttribute("aria-expanded", "false");

    if (!menuToggle.hasAttribute("aria-label")) {
      menuToggle.setAttribute("aria-label", "Toggle navigation menu");
    }

    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("active");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (event) => {
      if (
        navLinks.classList.contains("active") &&
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function showToast(message) {
    if (!toast) {
      console.info(message);
      return;
    }

    toast.textContent = message;
    toast.classList.add("show");
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 4000);
  }

  function updateTotal() {
    if (!quantityInput) return;

    let quantity = Number.parseInt(quantityInput.value, 10);

    if (!Number.isFinite(quantity)) quantity = 1;

    quantity = Math.min(20, Math.max(1, quantity));
    quantityInput.value = String(quantity);

    if (totalElement) {
      totalElement.textContent = `৳${(selectedPrice * quantity).toLocaleString("en-BD")}`;
    }
  }

  function openOrderDialog(productName, productPrice, trigger) {
    if (!orderDialog || typeof orderDialog.showModal !== "function") {
      showToast("Order form is unavailable. Please refresh the page.");
      console.error("Order dialog is missing or the browser does not support <dialog>.");
      return;
    }

    previousFocus = trigger || document.activeElement;
    selectedProduct = productName || "Classic Espresso";
    selectedPrice = Number(productPrice) || 180;

    if (productNameInput) productNameInput.value = selectedProduct;
    if (productPriceInput) productPriceInput.value = String(selectedPrice);
    if (quantityInput) quantityInput.value = "1";

    updateTotal();

    if (!orderDialog.open) {
      orderDialog.showModal();
    }

    const firstField = nameInput || orderDialog.querySelector(
      "input:not([type='hidden']), button, select, textarea"
    );

    firstField?.focus();
  }

  function closeOrderDialog() {
    if (orderDialog?.open) {
      orderDialog.close();
    }
  }

  // Support product buttons using data attributes.
  document.querySelectorAll(
    ".order-btn, .order-now, [data-product][data-price]"
  ).forEach((button) => {
    button.addEventListener("click", () => {
      const productName =
        button.dataset.product ||
        button.closest(".product-card, .menu-card, .coffee-card")
          ?.querySelector("h3")?.textContent?.trim() ||
        "Classic Espresso";

      const priceFromButton = button.dataset.price;
      const priceFromCard = button.closest(
        ".product-card, .menu-card, .coffee-card"
      )?.dataset.price;

      const priceText =
        priceFromButton ||
        priceFromCard ||
        button.closest(".product-card, .menu-card, .coffee-card")
          ?.querySelector(".price")?.textContent ||
        "180";

      const parsedPrice = Number(
        String(priceText).replace(/[^\d.]/g, "")
      );

      openOrderDialog(productName, parsedPrice, button);
    });
  });

  // Also support a general Order Now button in the navigation or hero.
  document.querySelectorAll(
    "#navOrder, #heroOrder, .nav-order, .hero-order"
  ).forEach((button) => {
    button.addEventListener("click", () => {
      openOrderDialog("Classic Espresso", 180, button);
    });
  });

  closeOrderButton?.addEventListener("click", closeOrderDialog);

  if (quantityInput) {
    quantityInput.min = "1";
    quantityInput.max = "20";
    quantityInput.step = "1";
    quantityInput.required = true;
    quantityInput.addEventListener("input", updateTotal);
    quantityInput.addEventListener("change", updateTotal);
  }

  // Clicking the dialog backdrop closes the form.
  orderDialog?.addEventListener("click", (event) => {
    if (event.target === orderDialog) {
      closeOrderDialog();
    }
  });

  // Native <dialog> handles Escape. Restore focus after it closes.
  orderDialog?.addEventListener("close", () => {
    if (previousFocus?.isConnected) {
      previousFocus.focus();
    }
  });

  function validateName(value) {
    return value.trim().length >= 2;
  }

  function validateBangladeshPhone(value) {
    // Accepts common BD mobile formats: 01XXXXXXXXX,
    // +8801XXXXXXXXX, 8801XXXXXXXXX.
    const digits = value.replace(/\D/g, "");
    return /^(?:01\d{9}|8801\d{9})$/.test(digits);
  }

  function formatBangladeshPhone(value) {
    let digits = value.replace(/\D/g, "");

    if (digits.startsWith("00880")) {
      digits = digits.slice(2);
    }

    if (digits.startsWith("0")) {
      digits = "88" + digits;
    } else if (digits.startsWith("1")) {
      digits = "880" + digits;
    }

    return digits;
  }

  orderForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!nameInput || !phoneInput || !quantityInput) {
      showToast("Order form fields are missing. Please check the HTML.");
      console.error("Required order fields were not found.");
      return;
    }

    const customerName = nameInput.value.trim();
    const customerPhone = phoneInput.value.trim();
    const quantity = Number.parseInt(quantityInput.value, 10);

    if (!validateName(customerName)) {
      nameInput.setCustomValidity("Please enter a name with at least 2 characters.");
      nameInput.reportValidity();
      nameInput.focus();
      return;
    }

    nameInput.setCustomValidity("");

    if (!validateBangladeshPhone(customerPhone)) {
      phoneInput.setCustomValidity(
        "Enter a valid Bangladesh mobile number, e.g. 01712345678."
      );
      phoneInput.reportValidity();
      phoneInput.focus();
      return;
    }

    phoneInput.setCustomValidity("");

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      quantityInput.setCustomValidity("Quantity must be between 1 and 20.");
      quantityInput.reportValidity();
      quantityInput.focus();
      return;
    }

    quantityInput.setCustomValidity("");

    const total = selectedPrice * quantity;
    const normalizedCustomerPhone = formatBangladeshPhone(customerPhone);

    const message = [
      "☕ *Brew Haven Order*",
      "",
      `Name: ${customerName}`,
      `Customer phone: ${normalizedCustomerPhone}`,
      `Item: ${selectedProduct}`,
      `Quantity: ${quantity}`,
      `Price per item: ৳${selectedPrice}`,
      `Total: ৳${total}`,
      "",
      "Please confirm my order. Thank you!"
    ].join("\n");

    const isDemoNumber =
      !WHATSAPP_NUMBER ||
      WHATSAPP_NUMBER === DEMO_NUMBER ||
      !/^\d{10,15}$/.test(WHATSAPP_NUMBER);

    if (isDemoNumber) {
      showToast(
        "Demo mode: add the client's real WhatsApp number in script.js to enable ordering."
      );
      console.warn(
        "Brew Haven is using a placeholder WhatsApp number. No order was sent."
      );
      return;
    }

    const whatsappURL =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Do not check window.open()'s return value: some browsers return null
    // when using noopener even when the new tab opens successfully.
    // Therefore, never show a false "popup blocked" failure message.
    window.open(whatsappURL, "_blank", "noopener,noreferrer");

    showToast(
      "Your order details are ready for WhatsApp. If it didn't open, allow pop-ups or open WhatsApp manually."
    );

    closeOrderDialog();
  });

  // Clear custom validation messages as the user edits fields.
  [nameInput, phoneInput, quantityInput].forEach((field) => {
    field?.addEventListener("input", () => field.setCustomValidity(""));
  });

  // Update footer year automatically if the element exists.
  const yearElement = document.querySelector("#currentYear, [data-current-year]");
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }

  // Avoid silently hiding broken image URLs.
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      console.error("Image failed to load:", img.currentSrc || img.src);
      img.classList.add("image-error");
      img.alt = img.alt || "Coffee image unavailable";
    });
  });

  console.info("Brew Haven script initialized.");
});