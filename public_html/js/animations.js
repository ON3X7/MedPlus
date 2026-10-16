(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reducedMotion ? 0 : 150;
  let navigationToken = 0;

  function normalizeModuleName(value) {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function updateMenu(moduleName) {
    document.querySelectorAll(".menu-item").forEach(button => {
      button.classList.toggle("active", button.dataset.module === moduleName);
    });
  }

  function showModule(page) {
    page.style.display = "block";
    page.classList.remove("anim-module-out", "anim-module-in");
    void page.offsetWidth;
    page.classList.add("anim-module-in");
  }

  function animatedModuleChange(moduleName) {
    const token = ++navigationToken;
    const target = document.getElementById(`pag-${normalizeModuleName(moduleName)}`);
    if (!target) {
      console.warn(`Página não construída ainda: pag-${normalizeModuleName(moduleName)}`);
      return;
    }

    localStorage.setItem("medplus_last_module", moduleName);
    updateMenu(moduleName);

    const current = Array.from(document.querySelectorAll(".module-page"))
      .find(page => getComputedStyle(page).display !== "none" && page !== target);

    if (!current) {
      document.querySelectorAll(".module-page").forEach(page => {
        if (page !== target) page.style.display = "none";
      });
      showModule(target);
      return;
    }

    current.classList.remove("anim-module-in");
    current.classList.add("anim-module-out");

    window.setTimeout(() => {
      if (token !== navigationToken) return;
      current.style.display = "none";
      current.classList.remove("anim-module-out");
      showModule(target);
    }, duration);
  }

  function restartAnimation(element, className) {
    if (!element || reducedMotion) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function observeDynamicContent(selector) {
    const element = document.querySelector(selector);
    if (!element) return;
    new MutationObserver(mutations => {
      if (mutations.some(mutation => mutation.type === "childList")) {
        restartAnimation(element, "anim-content-in");
      }
    }).observe(element, { childList: true, subtree: false });
  }

  function installModalAnimation() {
    const originalOpen = window.abrirModal;
    const originalClose = window.fecharModal;
    if (typeof originalOpen !== "function" || typeof originalClose !== "function") return;

    /* Fora do módulo animado, position: fixed volta a usar o viewport inteiro. */
    document.querySelectorAll(".custom-modal-overlay").forEach(overlay => {
      if (overlay.parentElement !== document.body) document.body.appendChild(overlay);
    });

    window.abrirModal = function (id) {
      originalOpen(id);
      const overlay = document.getElementById(id);
      const box = overlay?.querySelector(".custom-modal-box");
      if (overlay) overlay.style.display = "flex";
      document.documentElement.classList.add("modal-open");
      overlay?.classList.remove("anim-modal-out");
      box?.classList.remove("anim-modal-box-out");
      restartAnimation(overlay, "anim-modal-in");
      restartAnimation(box, "anim-modal-box-in");
    };

    window.fecharModal = function (id) {
      const overlay = document.getElementById(id);
      const box = overlay?.querySelector(".custom-modal-box");
      if (!overlay || reducedMotion) {
        originalClose(id);
        const hasOpenModal = Array.from(document.querySelectorAll(".custom-modal-overlay"))
          .some(modal => getComputedStyle(modal).display !== "none");
        if (!hasOpenModal) document.documentElement.classList.remove("modal-open");
        return;
      }
      overlay.classList.remove("anim-modal-in");
      box?.classList.remove("anim-modal-box-in");
      overlay.classList.add("anim-modal-out");
      box?.classList.add("anim-modal-box-out");
      window.setTimeout(() => {
        originalClose(id);
        overlay.classList.remove("anim-modal-out");
        box?.classList.remove("anim-modal-box-out");
        const hasOpenModal = Array.from(document.querySelectorAll(".custom-modal-overlay"))
          .some(modal => getComputedStyle(modal).display !== "none");
        if (!hasOpenModal) document.documentElement.classList.remove("modal-open");
      }, duration);
    };
  }

  function installRipples() {
    document.addEventListener("pointerdown", event => {
      const button = event.target.closest("button");
      if (!button || reducedMotion) return;
      button.classList.add("anim-ripple-host");
      const bounds = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "anim-ripple";
      ripple.style.left = `${event.clientX - bounds.left}px`;
      ripple.style.top = `${event.clientY - bounds.top}px`;
      button.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    /* Substitui apenas a transição visual; armazenamento e seleção continuam iguais. */
    window.mudarModulo = animatedModuleChange;
    installModalAnimation();
    installRipples();
    observeDynamicContent("#calendar");
    observeDynamicContent("#appointments");

    document.querySelectorAll(".tab-btn").forEach(button => {
      button.addEventListener("click", () => {
        requestAnimationFrame(() => {
          const visible = Array.from(document.querySelectorAll(".dynamic-fields"))
            .find(field => getComputedStyle(field).display !== "none");
          restartAnimation(visible, "anim-fields-in");
        });
      });
    });
  });
})();
