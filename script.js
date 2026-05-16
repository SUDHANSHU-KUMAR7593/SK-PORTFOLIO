const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

(function initTheme() {
  const html = document.documentElement;
  const toggle = $("#theme-toggle");
  if (!toggle) return;

  const savedTheme = localStorage.getItem("site-theme");
  const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const shouldUseLight = savedTheme ? savedTheme === "light" : systemPrefersLight;

  function applyTheme(isLight) {
    html.classList.toggle("light", isLight);
    toggle.setAttribute("aria-pressed", String(isLight));
    toggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    toggle.querySelector("span").textContent = isLight ? "☀" : "☾";
  }

  applyTheme(shouldUseLight);

  toggle.addEventListener("click", () => {
    const isLight = !html.classList.contains("light");
    localStorage.setItem("site-theme", isLight ? "light" : "dark");
    applyTheme(isLight);
  });
})();

(function initMobileNav() {
  const navToggle = $("#nav-toggle");
  const navLinks = $("#main-nav");
  if (!navToggle || !navLinks) return;

  function setMenu(open) {
    navLinks.classList.toggle("show", open);
    document.body.classList.toggle("menu-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  }

  navToggle.addEventListener("click", () => {
    setMenu(!navLinks.classList.contains("show"));
  });

  $$(".nav-link").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
})();

(function initActiveNav() {
  const links = $$(".nav-link");
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.remove("active"));
        const active = $(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add("active");
      });
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
})();

(function initTypingEffect() {
  const element = $(".typing");
  if (!element || prefersReducedMotion) return;

  const phrases = [
    "Full Stack Developer",
    "Python Backend Developer",
    "AI Project Builder",
    "Problem Solver"
  ];
  let phraseIndex = 0;
  let letterIndex = 0;
  let deleting = false;

  function tick() {
    const phrase = phrases[phraseIndex];
    letterIndex += deleting ? -1 : 1;
    element.textContent = phrase.slice(0, letterIndex);

    if (!deleting && letterIndex === phrase.length) {
      deleting = true;
      window.setTimeout(tick, 1250);
      return;
    }

    if (deleting && letterIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      window.setTimeout(tick, 240);
      return;
    }

    window.setTimeout(tick, deleting ? 38 : 76);
  }

  tick();
})();

(function initRevealAnimation() {
  const elements = $$(".reveal");
  if (!elements.length) return;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  elements.forEach((element) => observer.observe(element));
})();

(function initBackToTop() {
  const button = $("#topBtn");
  if (!button) return;

  function updateButton() {
    button.classList.toggle("show", window.scrollY > 500);
  }

  updateButton();
  window.addEventListener("scroll", updateButton, { passive: true });
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();

(function initYear() {
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();

(function initContactForm() {
  const form = $("#contact-form");
  const status = $("#form-status");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector("button[type='submit']");
    const originalText = submit.textContent;

    submit.disabled = true;
    submit.textContent = "Sending...";
    status.textContent = "Sending your message...";

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error("Form submission failed");

      status.textContent = "Message sent successfully. Thank you!";
      form.reset();
    } catch (error) {
      status.textContent = "Could not send the message right now. Please email me directly.";
    } finally {
      submit.disabled = false;
      submit.textContent = originalText;
    }
  });
})();
