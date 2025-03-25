// Mobile Only Sticky Navigation
document.addEventListener("DOMContentLoaded", function () {
  const stickyNav = document.querySelector(".sticky-nav");
  const mobileNav = document.querySelector(".mobile-nav");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  const sections = ["jobTitle", "company", "content", "details"];

  // Function to check if we're on mobile
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Function to check scroll position and toggle sticky navigation
  function checkScroll() {
    const scrollPosition = window.scrollY;
    const header = document.querySelector("header");

    if (isMobile() && scrollPosition > header.offsetHeight) {
      stickyNav.classList.add("visible");
    } else {
      stickyNav.classList.remove("visible");
    }
  }

  // Update mobile navigation to reflect current section
  function updateMobileNavigation(sectionId) {
    // Remove active class from all nav links
    mobileNavLinks.forEach((link) => {
      link.classList.remove("active");
    });

    // Add active class to the current section's nav link
    const activeSection = sectionId.split("-")[0]; // Extract base section name
    const activeLink = document.querySelector(
      `.mobile-nav-link[data-section="${activeSection}"]`
    );
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }

  // Listen for section changes
  function observeActiveSections() {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.attributeName === "class") {
          const section = mutation.target;
          if (section.classList.contains("active")) {
            updateMobileNavigation(section.id);
          }
        }
      });
    });

    // Observe all sections for class changes
    document.querySelectorAll(".section").forEach((section) => {
      observer.observe(section, { attributes: true });
    });
  }

  // Add event listeners for scroll and resize events
  window.addEventListener("scroll", checkScroll);
  window.addEventListener("resize", checkScroll);

  // Initialize sticky navigation state on page load
  checkScroll();

  // Add event listeners for mobile nav items
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", function () {
      const sectionId = this.getAttribute("data-section");
      if (sectionId) {
        navigateToSection(sectionId + "-section");
      }
    });
  });

  // Find the currently active section on page load and update mobile nav
  const activeSection = document.querySelector(".section.active");
  if (activeSection) {
    updateMobileNavigation(activeSection.id);
  }

  // Start observing sections for changes
  observeActiveSections();

  // Handle mobile login button click
  const mobileLoginBtn = document.getElementById("mobileLoginBtn");
  if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const loginPopup = document.getElementById("loginPopup");
      if (loginPopup) {
        loginPopup.classList.add("visible");
      }
    });
  }

  // Make navigateToSection available globally if it exists
  if (typeof window.navigateToSection !== "function") {
    window.navigateToSection = function (sectionId) {
      // Simple implementation for navigation
      document.querySelectorAll(".section").forEach((section) => {
        section.classList.remove("active");
      });
      document.getElementById(sectionId).classList.add("active");
      window.scrollTo(0, 0);
      updateMobileNavigation(sectionId);
    };
  }
});
