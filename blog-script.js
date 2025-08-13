// ===== BLOG-SPECIFIC JAVASCRIPT =====

// Import base functionality from main script
// (In a real implementation, you would import the main script functions)

// ===== UTILITY FUNCTIONS =====
const utils = {
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

  // Generate unique ID
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  },

  // Format number with commas
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  // Validate email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};

// ===== BLOG UTILITIES =====
const blogUtils = {
  // Calculate reading time based on word count
  calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  },

  // Format date for display
  formatDate(date) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  },

  // Generate table of contents
  generateTOC() {
    const headings = document.querySelectorAll(".blog-article h2[id]");
    const tocNav = document.querySelector(".toc-nav");

    if (!tocNav || headings.length === 0) return;

    tocNav.innerHTML = "";

    headings.forEach((heading, index) => {
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.className = "toc-link";
      link.textContent = heading.textContent
        .replace(/^\d+\.\s*/, "")
        .replace(/^[^\w\s]+\s*/, "");

      // Add click handler for smooth scrolling
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.smoothScrollToElement(heading);
        this.setActiveTOCLink(link);
      });

      tocNav.appendChild(link);
    });
  },

  // Smooth scroll to element
  smoothScrollToElement(element) {
    const headerHeight = 120;
    const targetPosition = element.offsetTop - headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  },

  // Set active TOC link
  setActiveTOCLink(activeLink) {
    document.querySelectorAll(".toc-link").forEach((link) => {
      link.classList.remove("active");
    });
    activeLink.classList.add("active");
  },

  // Update reading progress
  updateReadingProgress() {
    const article = document.querySelector(".blog-article");
    if (!article) return 0;

    const articleTop = article.offsetTop;
    const articleHeight = article.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollTop = window.pageYOffset;

    const progress = Math.min(
      Math.max((scrollTop - articleTop + windowHeight) / articleHeight, 0),
      1
    );

    return progress;
  },
};

// ===== LOADING SCREEN =====
class LoadingScreen {
  constructor() {
    this.loadingElement = document.getElementById("loadingScreen");
    this.init();
  }

  init() {
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

// ===== HEADER NAVIGATION =====
class Navigation {
  constructor() {
    this.header = document.getElementById("header");
    this.navMenu = document.getElementById("navMenu");
    this.mobileToggle = document.getElementById("mobileToggle");
    this.navLinks = document.querySelectorAll(".nav-link");

    this.init();
  }

  init() {
    this.bindEvents();
    this.handleScroll();
  }

  bindEvents() {
    // Mobile menu toggle
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener("click", () =>
        this.toggleMobileMenu()
      );
    }

    // Navigation links
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => this.handleNavClick(e));
    });

    // Scroll events
    window.addEventListener(
      "scroll",
      utils.throttle(() => {
        this.handleScroll();
      }, 16)
    );

    // Close mobile menu on resize
    window.addEventListener(
      "resize",
      utils.debounce(() => {
        if (window.innerWidth >= 1024) {
          this.closeMobileMenu();
        }
      }, 250)
    );

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !this.header.contains(e.target) &&
        this.navMenu.classList.contains("active")
      ) {
        this.closeMobileMenu();
      }
    });
  }

  toggleMobileMenu() {
    this.navMenu.classList.toggle("active");
    this.mobileToggle.classList.toggle("active");
    this.mobileToggle.setAttribute(
      "aria-expanded",
      this.navMenu.classList.contains("active")
    );
  }

  closeMobileMenu() {
    this.navMenu.classList.remove("active");
    this.mobileToggle.classList.remove("active");
    this.mobileToggle.setAttribute("aria-expanded", "false");
  }

  handleNavClick(e) {
    const href = e.target.getAttribute("href");

    // Handle internal links
    if (href && href.startsWith("#")) {
      e.preventDefault();
      const targetSection = document.querySelector(href);
      if (targetSection) {
        utils.smoothScrollTo(targetSection, 80);
        this.closeMobileMenu();
      }
    } else {
      // External links - close mobile menu
      this.closeMobileMenu();
    }
  }

  handleScroll() {
    const scrollY = window.pageYOffset;

    // Header background change
    if (scrollY > 100) {
      this.header.style.background = "rgba(255, 255, 255, 0.98)";
      this.header.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.15)";
    } else {
      this.header.style.background = "rgba(255, 255, 255, 0.95)";
      this.header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
    }
  }
}

// ===== TABLE OF CONTENTS COMPONENT =====
class TableOfContents {
  constructor() {
    this.tocLinks = document.querySelectorAll(".toc-link");
    this.headings = document.querySelectorAll(".blog-article h2[id]");
    this.currentActive = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.updateActiveLink();
  }

  bindEvents() {
    // Smooth scroll on TOC link click
    this.tocLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          blogUtils.smoothScrollToElement(targetElement);
        }
      });
    });

    // Update active link on scroll
    window.addEventListener(
      "scroll",
      utils.throttle(() => {
        this.updateActiveLink();
      }, 100)
    );
  }

  updateActiveLink() {
    let activeHeading = null;
    const scrollPosition = window.pageYOffset + 150;

    // Find the current active heading
    this.headings.forEach((heading) => {
      if (heading.offsetTop <= scrollPosition) {
        activeHeading = heading;
      }
    });

    if (activeHeading && activeHeading !== this.currentActive) {
      this.currentActive = activeHeading;

      // Update TOC links
      this.tocLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${activeHeading.id}`) {
          link.classList.add("active");
        }
      });
    }
  }
}

// ===== INVESTMENT CALCULATOR =====
class InvestmentCalculator {
  constructor() {
    this.form = document.querySelector(".calculator-widget");
    this.result = document.getElementById("calc-result");

    if (this.form) {
      this.init();
    }
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const calcButton = this.form.querySelector(".calc-button");

    if (calcButton) {
      calcButton.addEventListener("click", () => {
        this.calculateROI();
      });
    }

    // Calculate on Enter key press
    this.form.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.calculateROI();
      }
    });

    // Real-time calculation on input change
    const inputs = this.form.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener(
        "input",
        utils.debounce(() => {
          if (this.hasValidInputs()) {
            this.calculateROI();
          }
        }, 500)
      );
    });
  }

  hasValidInputs() {
    const propertyPrice =
      parseFloat(document.getElementById("property-price")?.value) || 0;
    const monthlyRent =
      parseFloat(document.getElementById("monthly-rent")?.value) || 0;
    return propertyPrice > 0 && monthlyRent > 0;
  }

  calculateROI() {
    const propertyPrice =
      parseFloat(document.getElementById("property-price")?.value) || 0;
    const downPaymentPercent =
      parseFloat(document.getElementById("down-payment")?.value) || 20;
    const monthlyRent =
      parseFloat(document.getElementById("monthly-rent")?.value) || 0;

    if (propertyPrice <= 0 || monthlyRent <= 0) {
      this.showResult(
        "Please enter valid property price and monthly rent.",
        "error"
      );
      return;
    }

    const downPayment = propertyPrice * (downPaymentPercent / 100);
    const loanAmount = propertyPrice - downPayment;
    const monthlyMortgage = this.calculateMortgagePayment(
      loanAmount,
      0.065,
      30
    ); // 6.5% for 30 years
    const monthlyExpenses = (propertyPrice * 0.01) / 12; // 1% annually for expenses
    const monthlyCashFlow = monthlyRent - monthlyMortgage - monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    const cashOnCashReturn =
      downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0;

    // Calculate additional metrics
    const capRate =
      ((monthlyRent * 12 - propertyPrice * 0.01) / propertyPrice) * 100;
    const onePercentRule = (monthlyRent / propertyPrice) * 100;

    const resultHTML = `
            <div class="calc-results">
                <div class="calc-metric">
                    <span class="calc-label">Monthly Cash Flow:</span>
                    <span class="calc-value ${
                      monthlyCashFlow >= 0 ? "positive" : "negative"
                    }">
                        $${monthlyCashFlow.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                    </span>
                </div>
                <div class="calc-metric">
                    <span class="calc-label">Cash-on-Cash Return:</span>
                    <span class="calc-value ${
                      cashOnCashReturn >= 8 ? "positive" : "neutral"
                    }">
                        ${cashOnCashReturn.toFixed(1)}%
                    </span>
                </div>
                <div class="calc-metric">
                    <span class="calc-label">Cap Rate:</span>
                    <span class="calc-value ${
                      capRate >= 6 ? "positive" : "neutral"
                    }">
                        ${capRate.toFixed(1)}%
                    </span>
                </div>
                <div class="calc-metric">
                    <span class="calc-label">1% Rule:</span>
                    <span class="calc-value ${
                      onePercentRule >= 1 ? "positive" : "neutral"
                    }">
                        ${onePercentRule.toFixed(2)}%
                    </span>
                </div>
                <div class="calc-metric">
                    <span class="calc-label">Down Payment:</span>
                    <span class="calc-value">
                        $${downPayment.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                    </span>
                </div>
                <div class="calc-summary">
                    <strong>Investment Grade: ${this.getInvestmentGrade(
                      cashOnCashReturn,
                      capRate,
                      monthlyCashFlow
                    )}</strong>
                </div>
            </div>
        `;

    this.showResult(resultHTML, "success");
  }

  calculateMortgagePayment(principal, annualRate, years) {
    const monthlyRate = annualRate / 12;
    const numPayments = years * 12;

    if (monthlyRate === 0) {
      return principal / numPayments;
    }

    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    return monthlyPayment;
  }

  getInvestmentGrade(cashOnCashReturn, capRate, monthlyCashFlow) {
    if (monthlyCashFlow < 0) return "Poor - Negative Cash Flow";
    if (cashOnCashReturn >= 12 && capRate >= 8) return "Excellent";
    if (cashOnCashReturn >= 8 && capRate >= 6) return "Good";
    if (cashOnCashReturn >= 5 && capRate >= 4) return "Fair";
    return "Below Average";
  }

  showResult(content, type) {
    if (!this.result) return;

    this.result.innerHTML = content;
    this.result.className = `calc-result show ${type}`;

    // Add CSS for calc results if not already added
    this.addCalculatorStyles();

    // Scroll result into view
    this.result.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }

  addCalculatorStyles() {
    if (document.querySelector("#calc-styles")) return;

    const styles = `
            .calc-results {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .calc-metric {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid var(--gray-200);
            }

            .calc-label {
                font-size: var(--font-size-sm);
                color: var(--gray-600);
            }

            .calc-value {
                font-weight: var(--font-weight-bold);
                font-size: var(--font-size-base);
            }

            .calc-value.positive {
                color: var(--accent-color);
            }

            .calc-value.negative {
                color: #e74c3c;
            }

            .calc-value.neutral {
                color: var(--gray-700);
            }

            .calc-summary {
                margin-top: 12px;
                padding: 12px;
                background: var(--gray-100);
                border-radius: var(--radius-lg);
                text-align: center;
                color: var(--primary-color);
            }
        `;

    const styleSheet = document.createElement("style");
    styleSheet.id = "calc-styles";
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}

// ===== SOCIAL SHARING =====
class SocialSharing {
  constructor() {
    this.init();
  }

  init() {
    this.createSharingButtons();
    this.bindEvents();
  }

  createSharingButtons() {
    const article = document.querySelector(".blog-article");
    if (!article) return;

    const sharingContainer = document.createElement("div");
    sharingContainer.className = "social-sharing";
    sharingContainer.innerHTML = `
            <div class="sharing-label">Share this article:</div>
            <div class="sharing-buttons">
                <button class="share-btn share-twitter" data-platform="twitter" aria-label="Share on Twitter">
                    <i class="fab fa-twitter"></i>
                </button>
                <button class="share-btn share-facebook" data-platform="facebook" aria-label="Share on Facebook">
                    <i class="fab fa-facebook-f"></i>
                </button>
                <button class="share-btn share-linkedin" data-platform="linkedin" aria-label="Share on LinkedIn">
                    <i class="fab fa-linkedin-in"></i>
                </button>
                <button class="share-btn share-copy" data-platform="copy" aria-label="Copy link">
                    <i class="fas fa-link"></i>
                </button>
            </div>
        `;

    // Insert after the first paragraph
    const firstParagraph = article.querySelector("p");
    if (firstParagraph) {
      firstParagraph.parentNode.insertBefore(
        sharingContainer,
        firstParagraph.nextSibling
      );
    }

    // Add CSS styles
    this.addSharingStyles();
  }

  addSharingStyles() {
    if (document.querySelector("#sharing-styles")) return;

    const styles = `
            .social-sharing {
                display: flex;
                align-items: center;
                gap: var(--space-4);
                margin: var(--space-8) 0;
                padding: var(--space-6);
                background: var(--gray-50);
                border-radius: var(--radius-xl);
                flex-wrap: wrap;
            }

            .sharing-label {
                font-weight: var(--font-weight-medium);
                color: var(--gray-700);
                font-size: var(--font-size-sm);
            }

            .sharing-buttons {
                display: flex;
                gap: var(--space-3);
            }

            .share-btn {
                width: 40px;
                height: 40px;
                border: none;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: var(--transition-all);
                font-size: var(--font-size-base);
            }

            .share-twitter {
                background: #1da1f2;
                color: white;
            }

            .share-facebook {
                background: #4267b2;
                color: white;
            }

            .share-linkedin {
                background: #0077b5;
                color: white;
            }

            .share-copy {
                background: var(--gray-600);
                color: white;
            }

            .share-btn:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }

            .share-btn.copied {
                background: var(--accent-color) !important;
                animation: pulse 0.6s ease-in-out;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            @media (max-width: 640px) {
                .social-sharing {
                    flex-direction: column;
                    text-align: center;
                    gap: var(--space-3);
                }
            }
        `;

    const styleSheet = document.createElement("style");
    styleSheet.id = "sharing-styles";
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  bindEvents() {
    document.addEventListener("click", (e) => {
      if (e.target.closest(".share-btn")) {
        const button = e.target.closest(".share-btn");
        const platform = button.getAttribute("data-platform");
        this.share(platform, button);
      }
    });
  }

  share(platform, button) {
    const url = window.location.href;
    const title = document.querySelector(".blog-title").textContent;
    const description =
      document.querySelector(".blog-intro").textContent.substring(0, 150) +
      "...";

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(title)}&via=AlthausRealEstate`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}&quote=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(
          description
        )}`;
        break;
      case "copy":
        this.copyToClipboard(url, button);
        return;
    }

    if (shareUrl) {
      window.open(
        shareUrl,
        "_blank",
        "width=600,height=400,scrollbars=yes,resizable=yes"
      );
    }
  }

  async copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      this.showCopySuccess(button);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      this.showCopySuccess(button);
    }
  }

  showCopySuccess(button) {
    button.classList.add("copied");
    const originalIcon = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i>';

    setTimeout(() => {
      button.classList.remove("copied");
      button.innerHTML = originalIcon;
    }, 2000);

    this.showNotification("Link copied to clipboard!", "success");
  }

  showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;

    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--accent-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// ===== READING PROGRESS BAR =====
class ReadingProgressBar {
  constructor() {
    this.createProgressBar();
    this.bindEvents();
  }

  createProgressBar() {
    const progressBar = document.createElement("div");
    progressBar.className = "reading-progress";
    progressBar.innerHTML = '<div class="reading-progress-bar"></div>';

    const styles = `
            .reading-progress {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: rgba(230, 126, 34, 0.1);
                z-index: 1000;
                transition: opacity 0.3s ease;
            }

            .reading-progress.hidden {
                opacity: 0;
            }

            .reading-progress-bar {
                height: 100%;
                background: var(--gradient-primary);
                width: 0%;
                transition: width 0.1s ease;
                border-radius: 0 2px 2px 0;
            }
        `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    document.body.appendChild(progressBar);
    this.progressBar = progressBar.querySelector(".reading-progress-bar");
    this.progressContainer = progressBar;
  }

  bindEvents() {
    window.addEventListener(
      "scroll",
      utils.throttle(() => {
        this.updateProgress();
      }, 16)
    );
  }

  updateProgress() {
    const progress = blogUtils.updateReadingProgress();
    if (this.progressBar) {
      this.progressBar.style.width = `${progress * 100}%`;
    }

    // Hide progress bar when not in article area
    const article = document.querySelector(".blog-article");
    if (article) {
      const articleRect = article.getBoundingClientRect();
      const isInArticle =
        articleRect.top < window.innerHeight && articleRect.bottom > 0;

      if (isInArticle) {
        this.progressContainer.classList.remove("hidden");
      } else {
        this.progressContainer.classList.add("hidden");
      }
    }
  }
}

// ===== NEWSLETTER FORM HANDLER =====
class NewsletterForm {
  constructor() {
    this.forms = document.querySelectorAll(".newsletter-form");
    this.init();
  }

  init() {
    this.forms.forEach((form) => {
      form.addEventListener("submit", (e) => {
        this.handleSubmit(e, form);
      });

      // Add real-time validation
      const emailInput = form.querySelector(".newsletter-input");
      if (emailInput) {
        emailInput.addEventListener("blur", () => {
          this.validateEmail(emailInput, form);
        });

        emailInput.addEventListener("input", () => {
          this.clearValidation(form);
        });
      }
    });
  }

  async handleSubmit(e, form) {
    e.preventDefault();

    const emailInput = form.querySelector(".newsletter-input");
    const submitButton = form.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();

    if (!this.isValidEmail(email)) {
      this.showFormFeedback(
        form,
        "Please enter a valid email address.",
        "error"
      );
      emailInput.focus();
      return;
    }

    // Show loading state
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
    submitButton.disabled = true;
    emailInput.disabled = true;

    try {
      // Simulate API call with realistic delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate occasional errors for testing
      if (Math.random() < 0.1) {
        throw new Error("Network error");
      }

      this.showFormFeedback(
        form,
        "Thank you for subscribing! Check your email for confirmation.",
        "success"
      );
      form.reset();

      // Track subscription (in real app, send to analytics)
      this.trackSubscription(email);
    } catch (error) {
      this.showFormFeedback(
        form,
        "Sorry, there was an error. Please try again.",
        "error"
      );
    } finally {
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
      emailInput.disabled = false;
    }
  }

  validateEmail(emailInput, form) {
    const email = emailInput.value.trim();
    if (email && !this.isValidEmail(email)) {
      this.showFormFeedback(
        form,
        "Please enter a valid email address.",
        "error"
      );
      emailInput.classList.add("error");
      return false;
    }
    return true;
  }

  clearValidation(form) {
    const emailInput = form.querySelector(".newsletter-input");
    emailInput.classList.remove("error");
    this.clearFormFeedback(form);
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showFormFeedback(form, message, type) {
    let feedback = form.querySelector(".form-feedback");

    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "form-feedback";
      form.appendChild(feedback);
    }

    feedback.textContent = message;
    feedback.className = `form-feedback ${type}`;

    // Auto-hide success messages after 5 seconds
    if (type === "success") {
      setTimeout(() => {
        this.clearFormFeedback(form);
      }, 5000);
    }
  }

  clearFormFeedback(form) {
    const feedback = form.querySelector(".form-feedback");
    if (feedback) {
      feedback.textContent = "";
      feedback.className = "form-feedback";
    }
  }

  trackSubscription(email) {
    // In a real application, you would send this to your analytics service
    console.log("Newsletter subscription:", email);

    // Example: Google Analytics event
    if (typeof gtag !== "undefined") {
      gtag("event", "newsletter_signup", {
        event_category: "engagement",
        event_label: "blog_page",
      });
    }
  }
}

// ===== BLOG FAQ COMPONENT =====
class BlogFAQ {
  constructor() {
    this.faqItems = document.querySelectorAll(".blog-faq .faq-item");
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.faqItems.forEach((item) => {
      const toggle = item.querySelector(".faq-toggle");
      const question = item.querySelector(".faq-question");

      if (toggle) {
        toggle.addEventListener("click", () => this.toggleFAQ(item));
      }

      if (question) {
        question.addEventListener("click", () => this.toggleFAQ(item));
      }

      // Keyboard accessibility
      question.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.toggleFAQ(item);
        }
      });
    });
  }

  toggleFAQ(item) {
    const isActive = item.classList.contains("active");
    const answer = item.querySelector(".faq-answer");

    // Close all other FAQ items
    this.faqItems.forEach((otherItem) => {
      if (otherItem !== item) {
        otherItem.classList.remove("active");
        const otherAnswer = otherItem.querySelector(".faq-answer");
        if (otherAnswer) {
          otherAnswer.style.maxHeight = "0";
        }
      }
    });

    // Toggle current item
    if (isActive) {
      item.classList.remove("active");
      answer.style.maxHeight = "0";
    } else {
      item.classList.add("active");
      answer.style.maxHeight = answer.scrollHeight + "px";

      // Scroll into view if needed
      setTimeout(() => {
        if (!utils.isInViewport(item, 0.2)) {
          item.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 300);
    }
  }
}

// ===== BACK TO TOP BUTTON =====
class BackToTop {
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
      utils.throttle(() => {
        if (window.pageYOffset > 300) {
          this.button.classList.add("visible");
        } else {
          this.button.classList.remove("visible");
        }
      }, 100)
    );

    // Scroll to top on click
    this.button.addEventListener("click", () => {
      utils.smoothScrollTo(document.body, 0);
    });
  }
}

// ===== PERFORMANCE OPTIMIZATIONS =====
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.lazyLoadImages();
    this.preloadCriticalResources();
    this.optimizeAnimations();
    this.setupIntersectionObserver();
  }

  lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
            }
            img.classList.remove("lazy");
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));
    }
  }

  preloadCriticalResources() {
    // Preload hero image
    const heroImage = document.querySelector(".blog-hero-image img");
    if (heroImage) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = heroImage.src;
      document.head.appendChild(link);
    }

    // Preload fonts
    const fontLink = document.createElement("link");
    fontLink.rel = "preload";
    fontLink.as = "font";
    fontLink.type = "font/woff2";
    fontLink.href =
      "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2";
    fontLink.crossOrigin = "anonymous";
    document.head.appendChild(fontLink);
  }

  optimizeAnimations() {
    // Reduce animations for users who prefer reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.style.setProperty("--transition-fast", "0ms");
      document.documentElement.style.setProperty("--transition-base", "0ms");
      document.documentElement.style.setProperty("--transition-slow", "0ms");
    }
  }

  setupIntersectionObserver() {
    // Observe elements for analytics
    const sections = document.querySelectorAll(".blog-section");

    if (sections.length > 0) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const sectionId = entry.target.id || "unknown";
              this.trackSectionView(sectionId);
            }
          });
        },
        { threshold: 0.5 }
      );

      sections.forEach((section) => sectionObserver.observe(section));
    }
  }

  trackSectionView(sectionId) {
    // Track section views for analytics
    if (typeof gtag !== "undefined") {
      gtag("event", "section_view", {
        event_category: "engagement",
        event_label: sectionId,
      });
    }
  }
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
class AccessibilityEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
    this.setupColorContrastToggle();
  }

  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      // ESC key to close modals/menus
      if (e.key === "Escape") {
        const navigation = document.querySelector(".nav-menu.active");
        if (navigation) {
          const navComponent = new Navigation();
          navComponent.closeMobileMenu();
        }
      }

      // Skip to main content
      if (
        e.key === "Tab" &&
        !e.shiftKey &&
        document.activeElement === document.body
      ) {
        const skipLink = document.createElement("a");
        skipLink.href = "#main";
        skipLink.textContent = "Skip to main content";
        skipLink.className = "skip-link";
        skipLink.style.cssText = `
                    position: absolute;
                    top: -40px;
                    left: 6px;
                    background: var(--primary-color);
                    color: white;
                    padding: 8px;
                    text-decoration: none;
                    border-radius: 4px;
                    z-index: 10000;
                `;

        skipLink.addEventListener("focus", () => {
          skipLink.style.top = "6px";
        });

        skipLink.addEventListener("blur", () => {
          skipLink.style.top = "-40px";
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
      }
    });
  }

  setupFocusManagement() {
    // Ensure focus is visible
    const style = document.createElement("style");
    style.textContent = `
            *:focus {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }
            
            .skip-link:focus {
                outline: none;
                box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.3);
            }
        `;
    document.head.appendChild(style);
  }

  setupScreenReaderSupport() {
    // Add screen reader only text for better context
    const srOnlyStyle = document.createElement("style");
    srOnlyStyle.textContent = `
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
        `;
    document.head.appendChild(srOnlyStyle);

    // Add context to links
    const externalLinks = document.querySelectorAll(
      'a[href^="http"]:not([href*="althaus.com"])'
    );
    externalLinks.forEach((link) => {
      const srText = document.createElement("span");
      srText.className = "sr-only";
      srText.textContent = " (opens in new window)";
      link.appendChild(srText);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }

  setupColorContrastToggle() {
    // Add high contrast mode toggle
    const contrastToggle = document.createElement("button");
    contrastToggle.innerHTML = '<i class="fas fa-adjust"></i>';
    contrastToggle.className = "contrast-toggle";
    contrastToggle.setAttribute("aria-label", "Toggle high contrast mode");
    contrastToggle.title = "Toggle high contrast mode";

    contrastToggle.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 48px;
            height: 48px;
            background: var(--gray-800);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            z-index: 1000;
            box-shadow: var(--shadow-lg);
            transition: var(--transition-all);
        `;

    contrastToggle.addEventListener("click", () => {
      document.body.classList.toggle("high-contrast");
      const isHighContrast = document.body.classList.contains("high-contrast");
      localStorage.setItem("highContrast", isHighContrast);
    });

    document.body.appendChild(contrastToggle);

    // Apply saved preference
    if (localStorage.getItem("highContrast") === "true") {
      document.body.classList.add("high-contrast");
    }

    // Add high contrast styles
    const contrastStyles = document.createElement("style");
    contrastStyles.textContent = `
            .high-contrast {
                filter: contrast(150%) brightness(110%);
            }
            
            .high-contrast .contrast-toggle {
                background: var(--primary-color) !important;
            }
        `;
    document.head.appendChild(contrastStyles);
  }
}

// ===== MAIN BLOG APPLICATION =====
class BlogApp {
  constructor() {
    this.components = {};
    this.init();
  }

  init() {
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
      // Initialize core components
      this.components.loadingScreen = new LoadingScreen();
      this.components.navigation = new Navigation();
      this.components.backToTop = new BackToTop();
      this.components.performanceOptimizer = new PerformanceOptimizer();
      this.components.accessibilityEnhancer = new AccessibilityEnhancer();

      // Initialize blog-specific components
      this.components.tableOfContents = new TableOfContents();
      this.components.investmentCalculator = new InvestmentCalculator();
      this.components.socialSharing = new SocialSharing();
      this.components.readingProgressBar = new ReadingProgressBar();
      this.components.newsletterForm = new NewsletterForm();
      this.components.blogFAQ = new BlogFAQ();

      // Initialize scroll animations
      this.initializeScrollAnimations();

      // Generate table of contents
      blogUtils.generateTOC();

      // Setup analytics
      this.setupAnalytics();

      // Setup error tracking
      this.setupErrorTracking();

      console.log("Blog App initialized successfully");
    } catch (error) {
      console.error("Error initializing blog app:", error);
      this.handleInitializationError(error);
    }
  }

  initializeScrollAnimations() {
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
      this.setupFallbackAnimations();
    }
  }

  setupFallbackAnimations() {
    const animatedElements = document.querySelectorAll("[data-aos]");

    if (animatedElements.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = "1";
              entry.target.style.transform = "translateY(0)";
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      animatedElements.forEach((element) => {
        element.style.opacity = "0";
        element.style.transform = "translateY(20px)";
        element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(element);
      });
    }
  }

  setupAnalytics() {
    // Track page view
    if (typeof gtag !== "undefined") {
      gtag("config", "GA_MEASUREMENT_ID", {
        page_title: document.title,
        page_location: window.location.href,
      });
    }

    // Track reading time
    let startTime = Date.now();
    let maxScroll = 0;

    window.addEventListener(
      "scroll",
      utils.throttle(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
            100
        );
        maxScroll = Math.max(maxScroll, scrollPercent);
      }, 1000)
    );

    window.addEventListener("beforeunload", () => {
      const readingTime = Math.round((Date.now() - startTime) / 1000);

      if (typeof gtag !== "undefined") {
        gtag("event", "blog_engagement", {
          event_category: "engagement",
          reading_time: readingTime,
          max_scroll_percent: maxScroll,
        });
      }
    });
  }

  setupErrorTracking() {
    window.addEventListener("error", (e) => {
      console.error("Blog error:", e.error);

      // Track errors in analytics
      if (typeof gtag !== "undefined") {
        gtag("event", "exception", {
          description: e.error.message,
          fatal: false,
        });
      }
    });

    window.addEventListener("unhandledrejection", (e) => {
      console.error("Unhandled promise rejection in blog:", e.reason);

      if (typeof gtag !== "undefined") {
        gtag("event", "exception", {
          description: e.reason.toString(),
          fatal: false,
        });
      }
    });
  }

  handleInitializationError(error) {
    // Show user-friendly error message
    const errorMessage = document.createElement("div");
    errorMessage.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                text-align: center;
                z-index: 10000;
                max-width: 400px;
            ">
                <h3 style="color: #e74c3c; margin-bottom: 1rem;">
                    <i class="fas fa-exclamation-triangle"></i>
                    Something went wrong
                </h3>
                <p style="color: #666; margin-bottom: 1.5rem;">
                    We're having trouble loading the page. Please refresh to try again.
                </p>
                <button onclick="window.location.reload()" style="
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                ">
                    Refresh Page
                </button>
            </div>
        `;

    document.body.appendChild(errorMessage);
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

// ===== INITIALIZE BLOG APPLICATION =====
const blogApp = new BlogApp();

// ===== GLOBAL ERROR HANDLING =====
window.addEventListener("error", (e) => {
  console.error("Blog error:", e.error);
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection in blog:", e.reason);
});

// ===== EXPORT FOR MODULE SYSTEMS =====
if (typeof module !== "undefined" && module.exports) {
  module.exports = { BlogApp, blogUtils, utils };
}
