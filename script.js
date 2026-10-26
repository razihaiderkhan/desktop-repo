const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");

const hero = document.querySelector(".hero");
const heroSlides = hero?.querySelector(".hero-slides");
const slides = hero ? [...hero.querySelectorAll(".hero-slide")] : [];
const slideButtons = hero ? [...hero.querySelectorAll(".hero-dot")] : [];
const currentSlideNumber = hero?.querySelector(".hero-current");
const progressBar = hero?.querySelector(".hero-progress");
const previousSlideButton = hero?.querySelector(".hero-previous");
const nextSlideButton = hero?.querySelector(".hero-next");
const pauseSlideButton = hero?.querySelector(".hero-pause");

if (
  hero &&
  heroSlides &&
  slides.length > 1 &&
  slideButtons.length === slides.length &&
  currentSlideNumber &&
  progressBar &&
  previousSlideButton &&
  nextSlideButton &&
  pauseSlideButton
) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let timer;
  let heroIsVisible = true;
  let isHovered = false;
  let hasFocus = false;
  let userPaused = false;

  const updateSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.inert = !isActive;
      slideButtons[slideIndex].classList.toggle("is-active", isActive);
      slideButtons[slideIndex].setAttribute("aria-pressed", String(isActive));
    });

    currentSlideNumber.textContent = String(activeIndex + 1).padStart(2, "0");
    progressBar.classList.remove("is-running");
    if (!reducedMotion.matches && !userPaused && !isHovered && !hasFocus && heroIsVisible && !document.hidden) {
      void progressBar.offsetWidth;
      progressBar.classList.add("is-running");
    }
  };

  const stopTimer = () => {
    window.clearTimeout(timer);
    timer = undefined;
    progressBar.classList.remove("is-running");
  };

  const scheduleNextSlide = () => {
    stopTimer();
    if (reducedMotion.matches || userPaused || isHovered || hasFocus || !heroIsVisible || document.hidden) {
      return;
    }

    progressBar.classList.add("is-running");
    timer = window.setTimeout(() => {
      updateSlide(getRandomNextIndex());
      scheduleNextSlide();
    }, 6500);
  };

  const changeSlide = (index) => {
    updateSlide(index);
    scheduleNextSlide();
  };

  const getRandomNextIndex = () => {
    const offset = Math.floor(Math.random() * (slides.length - 1)) + 1;
    return (activeIndex + offset) % slides.length;
  };

  heroSlides.classList.add("is-ready");
  pauseSlideButton.hidden = false;
  slideButtons.forEach((button, index) => {
    button.addEventListener("click", () => changeSlide(index));
  });
  previousSlideButton.addEventListener("click", () => changeSlide(activeIndex - 1));
  nextSlideButton.addEventListener("click", () => changeSlide(activeIndex + 1));
  pauseSlideButton.addEventListener("click", () => {
    userPaused = !userPaused;
    pauseSlideButton.setAttribute("aria-pressed", String(userPaused));
    pauseSlideButton.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
    pauseSlideButton.textContent = userPaused ? "▶" : "Ⅱ";
    scheduleNextSlide();
  });
  hero.addEventListener("mouseenter", () => {
    isHovered = true;
    stopTimer();
  });
  hero.addEventListener("mouseleave", () => {
    isHovered = false;
    scheduleNextSlide();
  });
  hero.addEventListener("focusin", () => {
    hasFocus = true;
    stopTimer();
  });
  hero.addEventListener("focusout", (event) => {
    if (!hero.contains(event.relatedTarget)) {
      hasFocus = false;
      scheduleNextSlide();
    }
  });
  document.addEventListener("visibilitychange", () => {
    scheduleNextSlide();
  });
  reducedMotion.addEventListener("change", scheduleNextSlide);

  if ("IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroIsVisible = entry.isIntersecting;
      scheduleNextSlide();
    });
    heroObserver.observe(hero);
  }

  scheduleNextSlide();
}

if (menuToggle && navigation) {
  document.body.classList.add("menu-ready");

  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !isExpanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

const revealElements = document.querySelectorAll(
  ".intro-heading, .intro-copy, .value-item, .section-heading, .rice-card, .sourcing-image, .sourcing-copy, .markets-copy, .pack-panel, .contact-copy, .contact-card",
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );

  revealElements.forEach((element) => {
    element.classList.add("js-reveal");
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const sectionLinks = document.querySelectorAll('.nav-link[href^="#"]');
const pageSections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window && sectionLinks.length > 0 && pageSections.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        for (const link of sectionLinks) {
          const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", isCurrent);
          if (isCurrent) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        }
      }
    },
    { rootMargin: "-30% 0px -60% 0px" },
  );

  pageSections.forEach((section) => sectionObserver.observe(section));
}
