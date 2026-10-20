
// ============================================
// BELLA VITA RESTAURANT
// Professional Interactive JavaScript
// ============================================

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  // ------------------------------------------
  // 1. CURRENT YEAR
  // ------------------------------------------

  const year = $("#currentYear");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // ------------------------------------------
  // 2. MOBILE NAVIGATION
  // ------------------------------------------

  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");

  function closeMenu() {
    if (!menuToggle || !navLinks) return;

    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute(
        "aria-label",
        open ? "Close navigation" : "Open navigation"
      );
    });

    $$("a", navLinks).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (
        navLinks.classList.contains("open") &&
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        menuToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }

  // ------------------------------------------
  // 3. STICKY NAVBAR SCROLL EFFECT
  // ------------------------------------------

  const navbar = $(".navbar");
  let scrollTicking = false;

  function updateNavbar() {
    if (navbar) {
      navbar.classList.toggle("scrolled", window.scrollY > 25);
    }

    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateNavbar);
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  updateNavbar();

  // ------------------------------------------
  // 4. SMOOTH SECTION NAVIGATION
  // CSS scroll-behavior handles the animation.
  // ------------------------------------------

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = $(href);

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
            ? "auto"
            : "smooth",
          block: "start",
        });

        if (window.history.replaceState) {
          window.history.replaceState(null, "", href);
        }
      }
    });
  });

  // ------------------------------------------
  // 5. REVEAL ANIMATIONS ON SCROLL
  // ------------------------------------------

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const revealTargets = [
    ".intro-image-wrap",
    ".intro-content",
    ".section-heading",
    ".menu-card",
    ".experience-content",
    ".reservation-info",
    ".reservation-form",
    ".contact-strip-inner",
    ".footer-brand",
    ".footer-column",
  ];

  const revealElements = [
    ...new Set(revealTargets.flatMap((selector) => $$(selector))),
  ];

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px",
      }
    );

    revealElements.forEach((element, index) => {
      element.classList.add("reveal");

      // Small stagger for menu cards
      if (element.classList.contains("menu-card")) {
        element.style.transitionDelay = `${(index % 4) * 80}ms`;
      }

      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  // ------------------------------------------
  // 6. INTERACTIVE MENU FILTERS
  // ------------------------------------------

  const filterButtons = $$(".filter-btn");
  const menuCards = $$(".menu-card");

  function filterMenu(category) {
    menuCards.forEach((card, index) => {
      const matches =
        category === "all" || card.dataset.category === category;

      card.hidden = !matches;

      if (matches) {
        card.classList.remove("visible");

        if (!reduceMotion) {
          card.animate(
            [
              { opacity: 0, transform: "translateY(12px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            {
              duration: 320,
              delay: (index % 4) * 45,
              easing: "ease-out",
            }
          );
        }
      }
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.filter || "all";

      filterButtons.forEach((otherButton) => {
        const active = otherButton === button;

        otherButton.classList.toggle("active", active);
        otherButton.setAttribute("aria-pressed", String(active));
      });

      filterMenu(category);
    });
  });

  // ------------------------------------------
  // 7. RESERVATION DATE: NO PAST DATES
  // ------------------------------------------

  const reservationDate = $("#reservationDate");

  function getLocalDateString(date) {
    const yearValue = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${yearValue}-${month}-${day}`;
  }

  if (reservationDate) {
    reservationDate.min = getLocalDateString(new Date());
  }

  // ------------------------------------------
  // 8. RESERVATION FORM VALIDATION
  // ------------------------------------------

  const reservationForm = $("#reservationForm");
  const formMessage = $("#formMessage");

  function showFormMessage(message, type) {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.classList.remove("success", "error");
    formMessage.classList.add(type);
  }

  if (reservationForm) {
    reservationForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!reservationForm.checkValidity()) {
        reservationForm.reportValidity();

        showFormMessage(
          "Please complete all required fields correctly.",
          "error"
        );

        return;
      }

      const formData = new FormData(reservationForm);

      const name = String(formData.get("guestName") || "").trim();
      const date = String(formData.get("reservationDate") || "");
      const time = String(formData.get("reservationTime") || "");
      const guests = String(formData.get("guestCount") || "");

      // Check date again in case it was manually entered
      if (date < getLocalDateString(new Date())) {
        showFormMessage(
          "Please choose today or a future date.",
          "error"
        );

        reservationDate?.focus();
        return;
      }

      const readableDate = new Date(`${date}T12:00:00`).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      showFormMessage(
        `Thanks, ${name}! Your demo request is prepared for ${readableDate} at ${time} for ${guests} guest(s). This is a demo only; no reservation has been sent to a restaurant.`,
        "success"
      );
    });

    reservationForm.addEventListener("input", () => {
      if (formMessage) {
        formMessage.textContent = "";
        formMessage.classList.remove("success", "error");
      }
    });
  }

  // ------------------------------------------
  // 9. IMAGE LOADING FALLBACK
  // Hide a failed image rather than showing a
  // broken-image icon.
  // ------------------------------------------

  $$("img").forEach((img) => {
    img.addEventListener("error", () => {
      img.classList.add("image-unavailable");
      img.setAttribute("aria-label", "Image unavailable");
    });
  });

  // ------------------------------------------
  // 10. BUTTON / CARD HOVER ACCESSIBILITY
  // Main visual hover effects are handled in CSS.
  // ------------------------------------------

  // Avoid animation when reduced motion is preferred.
  if (reduceMotion) {
    document.documentElement.classList.add("reduce-motion");
  }

  // ------------------------------------------
  // 11. READY
  // ------------------------------------------

  console.log("Bella Vita website is ready!");
});
