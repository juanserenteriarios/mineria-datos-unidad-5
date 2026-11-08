(() => {
  "use strict";

  const scoreData = {
    WEKA: [3, 4, 5, 4, 3, 2],
    KNIME: [5, 5, 4, 4, 5, 5],
    Orange: [3, 4, 4, 5, 4, 2],
    RapidMiner: [5, 5, 5, 4, 4, 5]
  };

  const scoreLabels = [
    "Acceso y comprensión",
    "Preparación",
    "Modelado y evaluación",
    "Visualización",
    "Reproducibilidad",
    "Despliegue"
  ];

  document.querySelectorAll(".score-bars").forEach((container) => {
    const scores = scoreData[container.dataset.tool] || [];
    scores.forEach((score, index) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      row.setAttribute("aria-label", `${scoreLabels[index]}: ${score} de 5`);

      const label = document.createElement("span");
      label.className = "bar-label";
      label.textContent = scoreLabels[index];

      const track = document.createElement("span");
      track.className = "bar-track";
      track.setAttribute("aria-hidden", "true");
      for (let i = 1; i <= 5; i += 1) {
        const segment = document.createElement("i");
        if (i <= score) segment.className = "filled";
        track.appendChild(segment);
      }

      const value = document.createElement("span");
      value.className = "bar-value";
      value.textContent = score;

      row.append(label, track, value);
      container.appendChild(row);
    });
  });

  const menuButton = document.querySelector(".menu-button");
  const navigation = document.querySelector("#site-nav");
  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  };

  menuButton?.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    navigation?.classList.toggle("is-open", !open);
  });

  navigation?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const cards = [...document.querySelectorAll(".case-card")];
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const searchInput = document.querySelector("#case-search");
  const caseCount = document.querySelector("#case-count");
  const noResults = document.querySelector("#no-results");
  let activeFilter = "all";

  const normalize = (value) => value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  const applyFilters = () => {
    const query = normalize(searchInput?.value || "");
    let visible = 0;

    cards.forEach((card) => {
      const toolMatch = activeFilter === "all" || card.dataset.tool === activeFilter;
      const haystack = normalize(`${card.dataset.search || ""} ${card.textContent || ""}`);
      const textMatch = !query || haystack.includes(query);
      const show = toolMatch && textMatch;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (caseCount) {
      caseCount.textContent = visible === 1
        ? "Mostrando 1 asociación verificada."
        : `Mostrando ${visible} asociaciones verificadas.`;
    }
    if (noResults) noResults.hidden = visible !== 0;
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      filterButtons.forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle("is-active", active);
        candidate.setAttribute("aria-pressed", String(active));
      });
      applyFilters();
    });
  });

  searchInput?.addEventListener("input", applyFilters);

  const revealTargets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -24px" });
    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  const navLinks = [...document.querySelectorAll("#site-nav a")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visibleSection) return;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${visibleSection.target.id}`;
        if (isCurrent) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }, { threshold: [0.25, 0.5], rootMargin: "-20% 0px -55%" });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  applyFilters();
})();

