// ===== ABOUT PAGE SPECIFIC FUNCTIONALITY =====

// Import utility functions from main script
// (In a real implementation, you would import these or include the main script)

// ===== UTILITY FUNCTIONS =====
const aboutUtils = {
  // Debounce function for performance optimization
  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  // Throttle function for scroll events
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Check if element is in viewport
  isInViewport(element, threshold = 0.1) {
    const rect = element.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.top <= windowHeight * (1 - threshold) &&
      rect.bottom >= windowHeight * threshold &&
      rect.left <= windowWidth * (1 - threshold) &&
      rect.right >= windowWidth * threshold
    );
  },

  // Smooth scroll to element
  smoothScrollTo(element, offset = 0) {
    const targetPosition = element.offsetTop - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start = null;

    function animation(currentTime) {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
  },

  // Format number with commas
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
};

// ===== LOADING SCREEN =====
class AboutLoadingScreen {
  constructor() {
    this.loadingElement = document.getElementById("loadingScreen");
    this.init();
  }

  init() {
    // Hide loading screen after page load
    window.addEventListener("load", () => {
      setTimeout(() => {
        this.hide();
      }, 1000);
    });
  }

  hide() {
    if (this.loadingElement) {
      this.loadingElement.classList.add("hidden");
      setTimeout(() => {
        this.loadingElement.style.display = "none";
      }, 500);
    }
  }
}

// ===== NAVIGATION =====
// Remove the AboutNavigation class entirely and update the initialization

// ===== COUNTER ANIMATION =====
class AboutCounterAnimation {
  constructor(elements) {
    this.elements = elements;
    this.observers = new Map();
    this.init();
  }

  init() {
    this.elements.forEach((element) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.animateCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(element);
      this.observers.set(element, observer);
    });
  }

  animateCounter(element) {
    const target =
      Number.parseInt(element.getAttribute("data-count")) ||
      Number.parseInt(element.textContent);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = aboutUtils.formatNumber(Math.floor(current));
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = aboutUtils.formatNumber(target);
      }
    };

    updateCounter();
  }

  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

// ===== TEAM MEMBER INTERACTIONS =====
class TeamMemberInteractions {
  constructor() {
    this.teamMembers = document.querySelectorAll(".team-member");
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.teamMembers.forEach((member) => {
      // Enhanced hover effects
      member.addEventListener("mouseenter", () => {
        this.highlightMember(member);
      });

      member.addEventListener("mouseleave", () => {
        this.resetMember(member);
      });

      // Social link interactions
      const socialLinks = member.querySelectorAll(".social-links a");
      socialLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.handleSocialClick(link, member);
        });
      });

      // Keyboard navigation
      member.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.showMemberDetails(member);
        }
      });
    });
  }

  highlightMember(member) {
    // Add subtle animation to other members
    this.teamMembers.forEach((otherMember) => {
      if (otherMember !== member) {
        otherMember.style.opacity = "0.7";
        otherMember.style.transform = "scale(0.98)";
      }
    });
  }

  resetMember(member) {
    // Reset all members
    this.teamMembers.forEach((member) => {
      member.style.opacity = "1";
      member.style.transform = "scale(1)";
    });
  }

  handleSocialClick(link, member) {
    const memberName = member.querySelector(".member-name").textContent;
    const platform = this.getSocialPlatform(link);

    console.log(`Opening ${platform} for ${memberName}`);

    // Show notification
    this.showNotification(
      `Opening ${platform} profile for ${memberName}`,
      "info"
    );

    // In a real implementation, you would open the actual social link
    // window.open(link.href, '_blank');
  }

  getSocialPlatform(link) {
    const icon = link.querySelector("i");
    if (icon.classList.contains("fa-linkedin-in")) return "LinkedIn";
    if (icon.classList.contains("fa-twitter")) return "Twitter";
    if (icon.classList.contains("fa-github")) return "GitHub";
    if (icon.classList.contains("fa-envelope")) return "Email";
    return "Social Media";
  }

  showMemberDetails(member) {
    const memberName = member.querySelector(".member-name").textContent;
    const memberRole = member.querySelector(".member-role").textContent;
    const memberBio = member.querySelector(".member-bio").textContent;

    console.log("Showing details for:", memberName);

    // This could open a modal with more detailed information
    this.showNotification(
      `Viewing details for ${memberName} - ${memberRole}`,
      "info"
    );
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${this.getNotificationIcon(type)}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close" aria-label="Close notification">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${this.getNotificationColor(type)};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 400px;
      min-width: 300px;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Close button
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => {
      this.hideNotification(notification);
    });

    // Auto hide
    setTimeout(() => {
      this.hideNotification(notification);
    }, 5000);
  }

  hideNotification(notification) {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  getNotificationIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    };
    return icons[type] || icons.info;
  }

  getNotificationColor(type) {
    const colors = {
      success: "#27ae60",
      error: "#e74c3c",
      warning: "#f39c12",
      info: "#3498db",
    };
    return colors[type] || colors.info;
  }
}

// ===== VALUE CARD INTERACTIONS =====
class ValueCardInteractions {
  constructor() {
    this.valueCards = document.querySelectorAll(".value-card");
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.valueCards.forEach((card, index) => {
      // Enhanced hover effects
      card.addEventListener("mouseenter", () => {
        this.highlightValue(card, index);
      });

      card.addEventListener("mouseleave", () => {
        this.resetValues();
      });

      // Click interactions
      card.addEventListener("click", () => {
        this.selectValue(card, index);
      });

      // Keyboard navigation
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.selectValue(card, index);
        }
      });

      // Make cards focusable
      card.setAttribute("tabindex", "0");
    });
  }

  highlightValue(card, index) {
    // Add ripple effect
    this.addRippleEffect(card);

    // Slightly dim other cards
    this.valueCards.forEach((otherCard, otherIndex) => {
      if (otherIndex !== index) {
        otherCard.style.opacity = "0.8";
      }
    });
  }

  resetValues() {
    this.valueCards.forEach((card) => {
      card.style.opacity = "1";
    });
  }

  selectValue(card, index) {
    const valueTitle = card.querySelector(".value-title").textContent;
    const valueDescription =
      card.querySelector(".value-description").textContent;

    console.log(`Selected value: ${valueTitle}`);

    // Add selection animation
    card.style.transform = "scale(1.05)";
    setTimeout(() => {
      card.style.transform = "scale(1)";
    }, 200);

    // Show more information about this value
    this.showValueDetails(valueTitle, valueDescription);
  }

  addRippleEffect(card) {
    const ripple = document.createElement("div");
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(230, 126, 34, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;

    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = "50%";
    ripple.style.top = "50%";
    ripple.style.marginLeft = -size / 2 + "px";
    ripple.style.marginTop = -size / 2 + "px";

    card.style.position = "relative";
    card.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  showValueDetails(title, description) {
    // This could open a modal or expand the card with more information
    console.log(`Showing details for value: ${title}`);

    // For now, we'll just show a notification
    const notification = document.createElement("div");
    notification.innerHTML = `
      <div style="background: var(--primary-color); color: white; padding: 1rem; border-radius: 8px; margin: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
        <h4 style="margin: 0 0 0.5rem 0;">${title}</h4>
        <p style="margin: 0; opacity: 0.9;">${description}</p>
      </div>
    `;

    // Position near the card
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      max-width: 400px;
      animation: fadeIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "fadeOut 0.3s ease";
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// ===== SERVICE CARD INTERACTIONS =====
class ServiceCardInteractions {
  constructor() {
    this.serviceCards = document.querySelectorAll(".service-card");
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.serviceCards.forEach((card, index) => {
      // Hover effects
      card.addEventListener("mouseenter", () => {
        this.highlightService(card);
      });

      card.addEventListener("mouseleave", () => {
        this.resetService(card);
      });

      // Click to learn more
      card.addEventListener("click", () => {
        this.showServiceDetails(card);
      });

      // Keyboard navigation
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.showServiceDetails(card);
        }
      });

      // Make cards focusable
      card.setAttribute("tabindex", "0");
    });
  }

  highlightService(card) {
    // Add glow effect
    card.style.boxShadow = "0 0 30px rgba(230, 126, 34, 0.3)";
  }

  resetService(card) {
    card.style.boxShadow = "";
  }

  showServiceDetails(card) {
    const serviceTitle = card.querySelector(".service-title").textContent;
    const serviceDescription = card.querySelector(
      ".service-description"
    ).textContent;
    const features = Array.from(
      card.querySelectorAll(".service-features li")
    ).map((li) => li.textContent);

    console.log(`Showing details for service: ${serviceTitle}`);
    console.log("Features:", features);

    // In a real implementation, this could:
    // - Open a detailed service page
    // - Show a modal with more information
    // - Scroll to a detailed services section

    // For now, we'll show an enhanced notification
    this.showServiceModal(serviceTitle, serviceDescription, features);
  }

  showServiceModal(title, description, features) {
    const modal = document.createElement("div");
    modal.className = "service-modal";
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close" aria-label="Close modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>${description}</p>
            <h4>Key Features:</h4>
            <ul>
              ${features.map((feature) => `<li>${feature}</li>`).join("")}
            </ul>
            <div class="modal-actions">
              <button class="btn btn--primary">Learn More</button>
              <button class="btn btn--outline">Contact Us</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add styles
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    `;

    // Add modal styles
    const modalStyles = `
      .modal-overlay {
        background: rgba(0, 0, 0, 0.8);
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }
      .modal-content {
        background: white;
        border-radius: 16px;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2rem 2rem 1rem;
        border-bottom: 1px solid #e2e8f0;
      }
      .modal-header h3 {
        margin: 0;
        color: #1e293b;
        font-size: 1.5rem;
      }
      .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #64748b;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.2s;
      }
      .modal-close:hover {
        background: #f1f5f9;
        color: #e67e22;
      }
      .modal-body {
        padding: 1rem 2rem 2rem;
      }
      .modal-body p {
        color: #64748b;
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }
      .modal-body h4 {
        color: #1e293b;
        margin-bottom: 1rem;
      }
      .modal-body ul {
        list-style: none;
        padding: 0;
        margin-bottom: 2rem;
      }
      .modal-body li {
        position: relative;
        padding-left: 1.5rem;
        margin-bottom: 0.5rem;
        color: #64748b;
      }
      .modal-body li::before {
        content: "✓";
        position: absolute;
        left: 0;
        color: #27ae60;
        font-weight: bold;
      }
      .modal-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
      }
    `;

    // Add styles to head
    const styleSheet = document.createElement("style");
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);

    document.body.appendChild(modal);

    // Close modal functionality
    const closeModal = () => {
      modal.style.animation = "fadeOut 0.3s ease";
      setTimeout(() => {
        modal.remove();
        styleSheet.remove();
      }, 300);
    };

    // Close button
    modal.querySelector(".modal-close").addEventListener("click", closeModal);

    // Close on overlay click
    modal.querySelector(".modal-overlay").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) {
        closeModal();
      }
    });

    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);

    // Button actions
    modal.querySelector(".btn--primary").addEventListener("click", () => {
      console.log(`Learning more about ${title}`);
      closeModal();
    });

    modal.querySelector(".btn--outline").addEventListener("click", () => {
      console.log(`Contacting about ${title}`);
      closeModal();
    });
  }
}

// ===== SCROLL ANIMATIONS =====
class AboutScrollAnimations {
  constructor() {
    this.elements = document.querySelectorAll("[data-aos]");
    this.observers = new Map();
    this.init();
  }

  init() {
    // Initialize AOS if available
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
        offset: 100,
        delay: 0,
      });
    } else {
      // Fallback animation system
      this.initFallbackAnimations();
    }
  }

  initFallbackAnimations() {
    this.elements.forEach((element) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.animateElement(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        }
      );

      observer.observe(element);
      this.observers.set(element, observer);
    });
  }

  animateElement(element) {
    const animation = element.getAttribute("data-aos") || "fade-up";
    const delay = Number.parseInt(element.getAttribute("data-aos-delay")) || 0;

    setTimeout(() => {
      element.classList.add("aos-animate");

      switch (animation) {
        case "fade-up":
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
          break;
        case "fade-left":
          element.style.opacity = "1";
          element.style.transform = "translateX(0)";
          break;
        case "fade-right":
          element.style.opacity = "1";
          element.style.transform = "translateX(0)";
          break;
        case "zoom-in":
          element.style.opacity = "1";
          element.style.transform = "scale(1)";
          break;
        default:
          element.style.opacity = "1";
      }
    }, delay);
  }

  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

// ===== BACK TO TOP BUTTON =====
class AboutBackToTop {
  constructor() {
    this.button = document.getElementById("backToTop");
    this.init();
  }

  init() {
    if (!this.button) return;

    this.bindEvents();
  }

  bindEvents() {
    // Show/hide button on scroll
    window.addEventListener(
      "scroll",
      aboutUtils.throttle(() => {
        if (window.pageYOffset > 300) {
          this.button.classList.add("visible");
        } else {
          this.button.classList.remove("visible");
        }
      }, 100)
    );

    // Scroll to top on click
    this.button.addEventListener("click", () => {
      aboutUtils.smoothScrollTo(document.body, 0);
    });
  }
}

// ===== CTA INTERACTIONS =====
class CTAInteractions {
  constructor() {
    this.ctaButtons = document.querySelectorAll(".cta-section .btn");
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.ctaButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleCTAClick(button);
      });
    });
  }

  handleCTAClick(button) {
    const buttonText = button.querySelector("span").textContent;

    // Add click animation
    button.style.transform = "scale(0.95)";
    setTimeout(() => {
      button.style.transform = "scale(1)";
    }, 150);

    // Handle different CTA actions
    if (buttonText.includes("Services")) {
      this.exploreServices();
    } else if (buttonText.includes("Contact")) {
      this.contactTeam();
    } else if (buttonText.includes("Careers")) {
      this.viewCareers();
    }
  }

  exploreServices() {
    console.log("Exploring services...");

    // Scroll to services section
    const servicesSection = document.querySelector(
      ".services-overview-section"
    );
    if (servicesSection) {
      aboutUtils.smoothScrollTo(servicesSection, 80);
    }

    // Show notification
    this.showNotification("Exploring our comprehensive services", "info");
  }

  contactTeam() {
    console.log("Contacting team...");

    // Scroll to contact section
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      aboutUtils.smoothScrollTo(contactSection, 80);
    }

    // Show notification
    this.showNotification("Ready to connect with our expert team", "success");
  }

  viewCareers() {
    console.log("Viewing careers...");

    // In a real implementation, this would navigate to a careers page
    this.showNotification("Opening career opportunities...", "info");
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${this.getNotificationIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${this.getNotificationColor(type)};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 400px;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Auto hide
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  getNotificationIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    };
    return icons[type] || icons.info;
  }

  getNotificationColor(type) {
    const colors = {
      success: "#27ae60",
      error: "#e74c3c",
      warning: "#f39c12",
      info: "#3498db",
    };
    return colors[type] || colors.info;
  }
}

// ===== MAIN ABOUT APPLICATION =====
class AboutApp {
  constructor() {
    this.components = {};
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.initializeComponents()
      );
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    try {
      // Initialize core components - use main Navigation class
      this.components.loadingScreen = new AboutLoadingScreen();
      // Navigation will be handled by the main script.js
      this.components.scrollAnimations = new AboutScrollAnimations();
      this.components.backToTop = new AboutBackToTop();

      // Initialize interactive components
      this.components.teamInteractions = new TeamMemberInteractions();
      this.components.valueInteractions = new ValueCardInteractions();
      this.components.serviceInteractions = new ServiceCardInteractions();
      this.components.ctaInteractions = new CTAInteractions();

      // Initialize counters
      this.initializeCounters();

      // Initialize smooth scrolling for all internal links
      this.initializeSmoothScrolling();

      // Initialize keyboard navigation
      this.initializeKeyboardNavigation();

      console.log("About App initialized successfully");
    } catch (error) {
      console.error("Error initializing about app:", error);
    }
  }

  initializeCounters() {
    const counterElements = document.querySelectorAll("[data-count]");
    if (counterElements.length) {
      this.components.counterAnimation = new AboutCounterAnimation(
        counterElements
      );
    }
  }

  initializeSmoothScrolling() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          e.preventDefault();
          aboutUtils.smoothScrollTo(targetElement, 80);
        }
      });
    });
  }

  initializeKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      // ESC key to close modals/menus
      if (e.key === "Escape") {
        // Close any open modals
        const modals = document.querySelectorAll(".service-modal");
        modals.forEach((modal) => modal.remove());
      }

      // Tab navigation enhancements
      if (e.key === "Tab") {
        // Add visual focus indicators
        document.body.classList.add("keyboard-navigation");
      }
    });

    // Remove keyboard navigation class on mouse use
    document.addEventListener("mousedown", () => {
      document.body.classList.remove("keyboard-navigation");
    });
  }

  // Cleanup method for SPA navigation
  destroy() {
    Object.values(this.components).forEach((component) => {
      if (component && typeof component.destroy === "function") {
        component.destroy();
      }
    });
  }
}

// ===== INITIALIZE ABOUT APPLICATION =====
const aboutApp = new AboutApp();

// ===== GLOBAL ERROR HANDLING =====
window.addEventListener("error", (e) => {
  console.error("Global error in about page:", e.error);
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection in about page:", e.reason);
});

// ===== ADD CUSTOM CSS FOR KEYBOARD NAVIGATION =====
const keyboardStyles = `
  .keyboard-navigation *:focus {
    outline: 2px solid #e67e22 !important;
    outline-offset: 2px !important;
  }
  
  .keyboard-navigation .team-member:focus,
  .keyboard-navigation .value-card:focus,
  .keyboard-navigation .service-card:focus {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(230, 126, 34, 0.3);
  }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = keyboardStyles;
document.head.appendChild(styleSheet);

// ===== EXPORT FOR MODULE SYSTEMS =====
if (typeof module !== "undefined" && module.exports) {
  module.exports = { AboutApp, aboutUtils };
}
