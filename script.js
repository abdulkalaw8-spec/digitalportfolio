
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  const root = document.documentElement;
  const navbar = $("#navbar");
  const progress = $("#progress");
  const navLinks = $("#navLinks");
  const menuToggle = $("#menuToggle");
  const themeToggle = $("#themeToggle");
  const typed = $("#typed");

  /* =========================================
     1. CURRENT YEAR
  ========================================= */

  const yearElement = $("#year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /* =========================================
     2. DARK / LIGHT MODE
  ========================================= */

  const themeColorMeta = $('meta[name="theme-color"]');

  function updateThemeButton() {
    if (!themeToggle) return;

    const isLight = root.dataset.theme === "light";

    themeToggle.textContent = isLight ? "☾" : "☼";
    themeToggle.setAttribute(
      "aria-label",
      isLight ? "Switch to dark mode" : "Switch to light mode"
    );
    themeToggle.title = isLight ? "Switch to dark mode" : "Switch to light mode";

    if (themeColorMeta) {
      themeColorMeta.content = isLight ? "#f5f7f0" : "#09140e";
    }
  }

  try {
    const savedTheme = localStorage.getItem("portfolio-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      root.dataset.theme = savedTheme;
    }
  } catch (error) {
    // The portfolio still works if browser storage is unavailable.
  }

  updateThemeButton();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";

      root.dataset.theme = nextTheme;

      try {
        localStorage.setItem("portfolio-theme", nextTheme);
      } catch (error) {
        // Theme switching still works for the current page.
      }

      updateThemeButton();
    });
  }

  /* =========================================
     3. MOBILE NAVIGATION
  ========================================= */

  function closeMobileMenu() {
    if (!navLinks || !menuToggle) return;

    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
    });

    $$("#navLinks a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("click", (event) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !navLinks.contains(target) &&
        !menuToggle.contains(target)
      ) {
        closeMobileMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        closeMobileMenu();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
      closeChat();
    }
  });

  /* =========================================
     4. SCROLL PROGRESS AND NAVBAR
  ========================================= */

  let scrollScheduled = false;

  function updateScrollUI() {
    const scrollTop = window.scrollY;
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const percentage =
      scrollableHeight > 0
        ? (scrollTop / scrollableHeight) * 100
        : 0;

    if (progress) {
      progress.style.width = `${percentage}%`;
    }

    if (navbar) {
      navbar.classList.toggle("scrolled", scrollTop > 15);
    }

    scrollScheduled = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollScheduled) {
        scrollScheduled = true;
        window.requestAnimationFrame(updateScrollUI);
      }
    },
    { passive: true }
  );

  updateScrollUI();

  /* =========================================
     5. ACTIVE NAVIGATION LINK
  ========================================= */

  const sections = $$("main section[id]");
  const navigationLinks = $$("#navLinks a[href^='#']");

  function setActiveLink(sectionId) {
    navigationLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        if (visibleEntries.length > 0) {
          setActiveLink(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5]
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* =========================================
     6. SCROLL REVEAL ANIMATIONS
  ========================================= */

  const revealElements = $$(".reveal-on-scroll");
  const skillFills = $$(".skill-fill");

  function animateSkills() {
    skillFills.forEach((bar) => {
      const width = bar.dataset.width;

      if (width) {
        bar.style.setProperty("--skill-width", width);
        bar.classList.add("animated");
      }
    });
  }

  function revealElement(element) {
    element.classList.add("revealed");

    if (element.id === "skills" || element.closest("#skills")) {
      animateSkills();
    }
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (
    prefersReducedMotion ||
    !("IntersectionObserver" in window)
  ) {
    revealElements.forEach(revealElement);
    animateSkills();
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  }

  /* =========================================
     7. TYPING ANIMATION
  ========================================= */

  if (typed && !prefersReducedMotion) {
    const words = [
      "Web Development",
      "Creative Design",
      "IT Support",
      "Problem Solving",
      "Digital Innovation"
    ];

    let wordIndex = 0;
    let characterIndex = words[0].length;
    let deleting = false;
    let typingTimer;

    function typeNextCharacter() {
      const currentWord = words[wordIndex];

      if (deleting) {
        characterIndex--;
      } else {
        characterIndex++;
      }

      typed.textContent = currentWord.slice(0, characterIndex);

      let delay = deleting ? 42 : 75;

      if (!deleting && characterIndex === currentWord.length) {
        deleting = true;
        delay = 1500;
      } else if (deleting && characterIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 350;
      }

      typingTimer = window.setTimeout(typeNextCharacter, delay);
    }

    typingTimer = window.setTimeout(typeNextCharacter, 1800);

    window.addEventListener("pagehide", () => {
      window.clearTimeout(typingTimer);
    });
  }

  /* =========================================
     8. MOUSE SPOTLIGHT
  ========================================= */

  const spotlight = $(".spotlight");
  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  if (spotlight && finePointer && !prefersReducedMotion) {
    document.addEventListener("pointermove", (event) => {
      spotlight.style.left = `${event.clientX}px`;
      spotlight.style.top = `${event.clientY}px`;
      spotlight.style.opacity = "1";
    });

    document.addEventListener("pointerleave", () => {
      spotlight.style.opacity = "0";
    });
  }

  /* =========================================
     9. PORTRAIT PARALLAX
  ========================================= */

  const portraitVisual = $("#portraitVisual");
  const portraitFrame = portraitVisual
    ? $(".frame", portraitVisual)
    : null;

  if (portraitVisual && portraitFrame && finePointer && !prefersReducedMotion) {
    portraitVisual.addEventListener("pointermove", (event) => {
      const bounds = portraitVisual.getBoundingClientRect();

      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

      portraitFrame.style.transform =
        `translate(${x * 7}px, ${y * 7}px)`;
    });

    portraitVisual.addEventListener("pointerleave", () => {
      portraitFrame.style.transform = "translate(0, 0)";
    });
  }

  /* =========================================
     10. PORTRAIT IMAGE FALLBACK
  ========================================= */

  const portraitImage = $(".portrait");
  const portraitFallback = $("#portraitFallback");

  if (portraitImage && portraitFallback) {
    function showPortraitFallback() {
      portraitImage.hidden = true;
      portraitFallback.hidden = false;
    }

    portraitImage.addEventListener("error", showPortraitFallback);

    if (
      portraitImage.complete &&
      portraitImage.naturalWidth === 0
    ) {
      showPortraitFallback();
    }
  }

  /* =========================================
     11. LOCAL PORTFOLIO FAQ ASSISTANT
  ========================================= */

  const chatToggle = $("#chatToggle");
  const portfolioChat = $("#portfolioChat");
  const chatClose = $("#chatClose");
  const chatLog = $("#chatLog");
  const questionButtons = $$(".chat-questions [data-question]");

  const answers = {
    "what does abdul do?":
      "Abdul Cedick K. Kalaw is an aspiring web designer, creative developer, and BSIT student. He is developing his skills in responsive web design, front-end development, and digital problem-solving.",

    "what skills are listed?":
      "Abdul is learning HTML, CSS, responsive design, and JavaScript. He also explores VS Code, Git and GitHub, Node.js, Express, UI/UX, and AI concepts.",

    "where did abdul study?":
      "The portfolio lists Torres Capitol College Inc., where Abdul is pursuing a Bachelor of Science in Information Technology. The listed period is 2023–2027 expected.",

    "how can i contact abdul?":
      "You can visit Abdul's GitHub profile at github.com/abdulkalaw8-spec. The email button also needs to be updated with his real email address before visitors can use it."
  };

  function openChat() {
    if (!portfolioChat || !chatToggle) return;

    portfolioChat.classList.add("open");
    portfolioChat.setAttribute("aria-hidden", "false");
    chatToggle.setAttribute("aria-expanded", "true");

    if (chatClose) {
      chatClose.focus();
    }
  }

  function closeChat() {
    if (!portfolioChat || !chatToggle) return;

    portfolioChat.classList.remove("open");
    portfolioChat.setAttribute("aria-hidden", "true");
    chatToggle.setAttribute("aria-expanded", "false");
  }

  function addChatMessage(message, type) {
    if (!chatLog) return;

    const messageElement = document.createElement("div");

    messageElement.className =
      type === "user"
        ? "chat-message user-message"
        : "chat-message assistant-message";

    // textContent keeps user-provided text from being treated as HTML.
    messageElement.textContent = message;

    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function normalizeQuestion(question) {
    return question
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[?!.,]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getAnswer(question) {
    const normalized = normalizeQuestion(question);

    if (answers[normalized]) {
      return answers[normalized];
    }

    if (normalized.includes("skill") || normalized.includes("tool")) {
      return answers["what skills are listed?"];
    }

    if (
      normalized.includes("study") ||
      normalized.includes("school") ||
      normalized.includes("education")
    ) {
      return answers["where did abdul study?"];
    }

    if (
      normalized.includes("contact") ||
      normalized.includes("email") ||
      normalized.includes("github")
    ) {
      return answers["how can i contact abdul?"];
    }

    if (
      normalized.includes("project") ||
      normalized.includes("maranawai") ||
      normalized.includes("portfolio")
    ) {
      return "Abdul's portfolio showcases four projects or concepts: Personal Portfolio, MaranawAI, EduTech Mobile, and Water Refilling Station Management System. Some projects are still concepts or in development.";
    }

    if (
      normalized.includes("who is abdul") ||
      normalized.includes("what does abdul do")
    ) {
      return answers["what does abdul do?"];
    }

    return "I can answer questions about Abdul's skills, projects, education, and contact details. Try one of the suggested questions below.";
  }

  function handleChatQuestion(question) {
    if (!question) return;

    addChatMessage(question, "user");

    window.setTimeout(() => {
      addChatMessage(getAnswer(question), "assistant");
    }, 250);
  }

  if (chatToggle) {
    chatToggle.addEventListener("click", () => {
      const isOpen =
        portfolioChat &&
        portfolioChat.classList.contains("open");

      if (isOpen) {
        closeChat();
      } else {
        openChat();
      }
    });
  }

  if (chatClose) {
    chatClose.addEventListener("click", closeChat);
  }

  questionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleChatQuestion(button.dataset.question || "");
    });
  });

  /* =========================================
     12. SMOOTH INTERNAL NAVIGATION
  ========================================= */

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = $(href);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });

      if (history.replaceState) {
        history.replaceState(null, "", href);
      }
    });
  });

  /* =========================================
     13. INITIAL PAGE STATE
  ========================================= */

  // Reveal the hero immediately if the page is already at the top.
  revealElements
    .filter((element) => {
      return element.getBoundingClientRect().top < window.innerHeight * 0.85;
    })
    .forEach(revealElement);

  console.log("Abdul Kalaw Portfolio initialized successfully.");
});
