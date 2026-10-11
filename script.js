
/* =========================================
   ABDUL CEDICK K. KALAW
   Portfolio Interactions & Animations
========================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const root = document.documentElement;
  const navbar = $("#navbar");
  const progress = $("#progress");
  const navLinks = $("#navLinks");
  const menuToggle = $("#menuToggle");
  const themeToggle = $("#themeToggle");
  const typed = $("#typed");

  /* ======================================
     1. CURRENT YEAR
  ====================================== */

  const year = $("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* ======================================
     2. DARK / LIGHT MODE
  ====================================== */

  function applyTheme(theme) {
    root.dataset.theme = theme;

    themeToggle.textContent = theme === "dark" ? "☼" : "☾";

    themeToggle.setAttribute(
      "aria-label",
      theme === "dark"
        ? "Switch to light mode"
        : "Switch to dark mode"
    );

    const themeColor = $("meta[name='theme-color']");

    if (themeColor) {
      themeColor.content =
        theme === "dark" ? "#0b1711" : "#f4f7ef";
    }
  }

  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("portfolio-theme");
  } catch (error) {
    // Continue normally if browser storage is unavailable.
  }

  const preferredTheme =
    savedTheme ||
    (window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark");

  applyTheme(preferredTheme);

  themeToggle.addEventListener("click", () => {
    const nextTheme =
      root.dataset.theme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);

    try {
      localStorage.setItem("portfolio-theme", nextTheme);
    } catch (error) {
      // Theme still works for the current page.
    }
  });

  /* ======================================
     3. MOBILE NAVIGATION
  ====================================== */

  function closeMenu() {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "×" : "☰";
  });

  $$("#navLinks a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      closeChat();
    }
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

  /* ======================================
     4. SCROLL PROGRESS & NAVBAR
  ====================================== */

  let scrollTicking = false;

  function updateScrollUI() {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;

    const percentage =
      scrollable > 0 ? window.scrollY / scrollable : 0;

    progress.style.transform =
      `scaleX(${Math.min(1, Math.max(0, percentage))})`;

    navbar.classList.toggle("scrolled", window.scrollY > 20);

    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateScrollUI);
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  updateScrollUI();

  /* ======================================
     5. ACTIVE NAVIGATION LINK
  ====================================== */

  const sections = $$("main section[id]");
  const sectionLinks = $$("#navLinks a");

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          sectionLinks.forEach((link) => {
            const active =
              link.getAttribute("href") === `#${entry.target.id}`;

            link.classList.toggle("active", active);

            if (active) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  /* ======================================
     6. SCROLL REVEAL ANIMATIONS
  ====================================== */

  const revealElements = $$(".reveal-on-scroll");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");

          // Animate skill bars only when their card appears.
          $$(".skill-track span", entry.target).forEach((bar) => {
            const width = bar.dataset.width;

            if (width) {
              bar.style.setProperty("--skill-width", width);
              bar.classList.add("animated");
            }
          });

          observer.unobserve(entry.target);
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
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");

      $$(".skill-track span", element).forEach((bar) => {
        bar.style.setProperty("--skill-width", bar.dataset.width || "0%");
        bar.classList.add("animated");
      });
    });
  }

  /* ======================================
     7. TYPING ANIMATION
  ====================================== */

  if (typed) {
    const words = [
      "Web Development",
      "Creative Design",
      "IT Support",
      "Problem Solving",
      "Digital Innovation"
    ];

    let wordIndex = 0;
    let characterIndex = words[0].length;
    let deleting = true;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      typed.textContent = words[0];
    } else {
      function typeLoop() {
        const currentWord = words[wordIndex];

        if (deleting) {
          characterIndex--;
        } else {
          characterIndex++;
        }

        typed.textContent = currentWord.slice(
          0,
          Math.max(0, characterIndex)
        );

        let delay = deleting ? 38 : 75;

        if (!deleting && characterIndex >= currentWord.length) {
          deleting = true;
          delay = 1500;
        } else if (deleting && characterIndex <= 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          delay = 350;
        }

        window.setTimeout(typeLoop, delay);
      }

      window.setTimeout(typeLoop, 1500);
    }
  }

  /* ======================================
     8. MOUSE-FOLLOWING CARD GLOW
  ====================================== */

  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  if (finePointer) {
    $$(".spotlight").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        card.style.setProperty("--mx", `${x}px`);
        card.style.setProperty("--my", `${y}px`);
      });
    });
  }

  /* ======================================
     9. SUBTLE PORTRAIT PARALLAX
  ====================================== */

  const visual = $("#portraitVisual");
  const frame = $(".frame", visual);

  if (visual && frame && finePointer) {
    visual.addEventListener("pointermove", (event) => {
      const rect = visual.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) / rect.width - 0.5;

      const y =
        (event.clientY - rect.top) / rect.height - 0.5;

      frame.style.transform =
        `rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    });

    visual.addEventListener("pointerleave", () => {
      frame.style.transform = "";
    });
  }

  /* ======================================
     10. PORTFOLIO FAQ ASSISTANT
     This is a local FAQ, not an AI API.
  ====================================== */

  const chatToggle = $("#chatToggle");
  const chat = $("#portfolioChat");
  const chatClose = $("#chatClose");
  const chatLog = $("#chatLog");

  const answers = {
    "what does abdul do?":
      "Abdul is an IT student interested in web development, IT support, troubleshooting, and creative digital projects.",

    "what skills are listed?":
      "The portfolio lists HTML, CSS, JavaScript, IT fundamentals, computer troubleshooting, VS Code, Git, and GitHub. These should reflect his actual experience.",

    "where did abdul study?":
      "The education section lists Torres Capitol College Inc. and a Bachelor of Science in Information Technology program, with 2023–2027 shown as the expected period.",

    "how can i contact abdul?":
      "You can use the email button or visit the GitHub profile linked in the Contact section. Remember to replace the sample email with a real address."
  };

  function addChatMessage(message, type) {
    const paragraph = document.createElement("p");

    paragraph.className = type;
    paragraph.textContent = message;

    chatLog.appendChild(paragraph);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function openChat() {
    chat.classList.add("open");
    chat.setAttribute("aria-hidden", "false");
    chatToggle.setAttribute("aria-expanded", "true");
  }

  function closeChat() {
    if (!chat || !chatToggle) return;

    chat.classList.remove("open");
    chat.setAttribute("aria-hidden", "true");
    chatToggle.setAttribute("aria-expanded", "false");
  }

  chatToggle.addEventListener("click", () => {
    if (chat.classList.contains("open")) {
      closeChat();
    } else {
      openChat();
    }
  });

  chatClose.addEventListener("click", closeChat);

  $$(".chat-q button").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.dataset.question;

      if (!question) return;

      addChatMessage(question, "me");

      const answer =
        answers[question.toLowerCase()] ||
        "Please explore the About, Skills, Education, and Contact sections for more information.";

      window.setTimeout(() => {
        addChatMessage(answer, "bot");
      }, 250);
    });
  });

  /* ======================================
     11. IMAGE FALLBACK
  ====================================== */

  const portrait = $(".portrait");

  if (portrait) {
    portrait.addEventListener("error", () => {
      portrait.style.display = "none";

      const frameElement = $(".frame");

      if (frameElement && !$("#portraitFallback", frameElement)) {
        const fallback = document.createElement("div");

        fallback.id = "portraitFallback";
        fallback.textContent = "AC";
        fallback.style.cssText = [
          "position:absolute",
          "inset:0",
          "display:grid",
          "place-items:center",
          "font-size:100px",
          "font-weight:800",
          "color:#e8bf63",
          "font-family:Space Grotesk,sans-serif"
        ].join(";");

        frameElement.appendChild(fallback);
      }
    });
  }

  /* ======================================
     12. SMOOTH INTERNAL NAVIGATION
  ====================================== */

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = $(href);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth",
        block: "start"
      });

      if (href === "#top") {
        history.replaceState(null, "", window.location.pathname);
      }
    });
  });

  console.log("✨ Abdul Cedick's portfolio is ready!");
});
