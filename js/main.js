(function () {
  "use strict";

  var STORAGE_KEY = "oihane-50-favorita";

  var EXPERIENCES = {
    yoga: {
      name: "El viaje hacia tu interior",
      places: "Rishikesh, India"
    },
    naturaleza: {
      name: "Un regalo para cuerpo y alma",
      places: "Kerala, Rishikesh, Delhi y Agra, según itinerario"
    }
  };

  var phase = "closed";
  var choice = null;
  var timers = [];
  var confettiPromise = null;
  var revealsReady = false;

  var envelope = document.getElementById("envelope");
  var details = document.getElementById("regalo-contenido");
  var summary = document.getElementById("abrir");
  var reveal = document.getElementById("revelacion");
  var saludo = document.getElementById("saludo");
  var anuncios = document.getElementById("anuncios");
  var statusChoice = document.getElementById("estado-eleccion");
  var statusCopy = document.getElementById("estado-copia");
  var copyButton = document.getElementById("copiar");
  var manualCopy = document.getElementById("copia-manual");
  var manualText = document.getElementById("copia-texto");
  var replay = document.getElementById("reiniciar");

  document.documentElement.classList.add("js");

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);

  function prefersReduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function later(fn, ms) {
    var id = window.setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function clearTimers() {
    timers.forEach(function (id) {
      window.clearTimeout(id);
    });
    timers = [];
  }

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReduced() ? "auto" : "smooth",
      block: "start"
    });
  }

  function announce(message) {
    if (!anuncios) return;
    anuncios.textContent = "";
    window.setTimeout(function () {
      anuncios.textContent = message;
    }, 30);
  }

  function readPref() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      return Object.prototype.hasOwnProperty.call(EXPERIENCES, value) ? value : null;
    } catch (error) {
      return null;
    }
  }

  function savePref(id) {
    try {
      localStorage.setItem(STORAGE_KEY, id);
      return true;
    } catch (error) {
      return false;
    }
  }

  function choiceMessage(id, saved) {
    var message = "¡Qué buena elección, Oihane! Esta es la experiencia que más te ilusiona. Ahora podremos elegir el retiro, las fechas y todos esos pequeños detalles que harán que el viaje sea exactamente como tú lo imaginas. Lo importante es que este regalo es tuyo y está pensado para que lo disfrutes a tu manera.";
    if (saved) return message;
    return message + " En esta visita ha quedado marcada, aunque este navegador no ha permitido guardarla en el dispositivo.";
  }

  function choicePlainText() {
    var exp = EXPERIENCES[choice];
    if (!exp) return "";
    return [
      "50 vueltas al sol — para Oihane",
      "",
      "Experiencia que me ilusiona: " + exp.name,
      "Lugares: " + exp.places,
      "",
      "Preferencia guardada solo en este dispositivo. El viaje se organiza cuando elijas el programa."
    ].join("\n");
  }

  function paintChoice(id, saved) {
    choice = id;
    document.querySelectorAll("[data-choose]").forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-choose") === id ? "true" : "false");
    });
    document.querySelectorAll(".exp").forEach(function (article) {
      article.classList.toggle("is-favorite", article.getAttribute("data-exp") === id);
    });
    if (statusChoice) statusChoice.textContent = choiceMessage(id, saved);
    if (copyButton) copyButton.hidden = false;
    if (statusCopy) statusCopy.textContent = "";
    if (manualCopy) manualCopy.hidden = true;
  }

  function selectExperience(id) {
    if (!EXPERIENCES[id]) return;
    var saved = savePref(id);
    paintChoice(id, saved);
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.left = "0";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (error) {
      ok = false;
    }
    document.body.removeChild(area);
    return ok;
  }

  function showManualCopy(text) {
    if (!manualCopy || !manualText) return;
    manualText.value = text;
    manualCopy.hidden = false;
    manualText.focus();
    manualText.select();
  }

  function copyChoice() {
    if (!choice) return;
    var text = choicePlainText();

    function success() {
      if (statusCopy) statusCopy.textContent = "Elección copiada. Ya puedes pegarla donde quieras.";
      if (manualCopy) manualCopy.hidden = true;
    }

    function failure() {
      showManualCopy(text);
      if (statusCopy) {
        statusCopy.textContent = "No se ha podido copiar sola. El texto de abajo está seleccionado para que lo copies a mano.";
      }
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(success).catch(function () {
        if (fallbackCopy(text)) success();
        else failure();
      });
      return;
    }

    if (fallbackCopy(text)) success();
    else failure();
  }

  function dismissSummary() {
    if (!summary) return;
    summary.classList.add("is-dismissed");
    summary.tabIndex = -1;
    summary.setAttribute("aria-expanded", "true");
    summary.setAttribute("aria-hidden", "true");
  }

  function restoreSummary() {
    if (!summary) return;
    summary.classList.remove("is-dismissed");
    summary.tabIndex = 0;
    summary.setAttribute("aria-expanded", "false");
    summary.removeAttribute("aria-hidden");
  }

  function loadConfetti() {
    if (window.confetti) return Promise.resolve(window.confetti);
    if (confettiPromise) return confettiPromise;
    confettiPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js";
      script.async = true;
      script.onload = function () {
        if (window.confetti) resolve(window.confetti);
        else reject(new Error("confetti"));
      };
      script.onerror = function () {
        reject(new Error("confetti"));
      };
      document.body.appendChild(script);
    });
    return confettiPromise;
  }

  function celebrate() {
    if (prefersReduced() || phase !== "open") return;
    loadConfetti().then(function (confetti) {
      if (phase !== "open" || prefersReduced()) return;
      var originY = 0.28;
      if (reveal) {
        var rect = reveal.getBoundingClientRect();
        originY = Math.min(0.42, Math.max(0.12, (rect.top + rect.height * 0.22) / window.innerHeight));
      }
      confetti({
        particleCount: 50,
        spread: 58,
        startVelocity: 24,
        gravity: 0.9,
        ticks: 170,
        scalar: 0.78,
        origin: { x: 0.5, y: originY },
        colors: ["#C86D51", "#D8AE65", "#FDFBF7", "#89977B", "#E8C98A"],
        disableForReducedMotion: true
      });
    }).catch(function () {
      /* La revelación sigue siendo válida si el confeti no carga. */
    });
  }

  function enhanceReveals(scope) {
    if (prefersReduced() || !window.gsap || !window.ScrollTrigger || !scope) return;
    try {
      window.gsap.utils.toArray(scope.querySelectorAll("[data-reveal]")).forEach(function (el) {
        if (el.getAttribute("data-revealed") === "true") return;
        el.setAttribute("data-revealed", "true");
        window.gsap.from(el, {
          y: 18,
          opacity: 0,
          duration: 0.85,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true
          }
        });
      });
      window.ScrollTrigger.refresh();
    } catch (error) {
      scope.querySelectorAll("[data-reveal]").forEach(function (el) {
        el.style.opacity = "";
        el.style.transform = "";
      });
    }
  }

  function setupMotion() {
    if (prefersReduced() || !window.gsap || !window.ScrollTrigger) return;
    try {
      window.gsap.registerPlugin(window.ScrollTrigger);
      var desktop = window.matchMedia("(min-width: 900px)").matches;
      var heroImage = document.querySelector(".hero__media img");
      if (desktop && heroImage) {
        document.documentElement.classList.add("has-parallax");
        window.gsap.fromTo(heroImage, { yPercent: -4 }, {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      }
      var letter = document.getElementById("carta");
      if (letter) enhanceReveals(letter);
      revealsReady = true;
    } catch (error) {
      document.documentElement.classList.remove("has-parallax");
    }
  }

  function focusSaludo() {
    if (!saludo) return;
    window.setTimeout(function () {
      if (phase !== "open") return;
      saludo.focus({ preventScroll: true });
    }, prefersReduced() ? 0 : 80);
  }

  function finishOpen() {
    if (phase === "open") return;
    phase = "open";
    if (envelope) envelope.classList.add("is-opening", "is-open");
    if (details) details.open = true;
    if (reveal) reveal.classList.add("is-revealed");
    dismissSummary();
    announce("Namasté, Oihane. Nos vamos a la India.");
    scrollToId("revelacion");
    focusSaludo();
    enhanceReveals(details);
  }

  function beginOpen() {
    if (phase !== "closed") return;
    if (prefersReduced()) {
      finishOpen();
      return;
    }

    phase = "opening";
    if (summary) summary.setAttribute("aria-expanded", "true");
    if (envelope) envelope.classList.add("is-opening");

    later(function () {
      if (phase !== "opening") return;
      if (envelope) envelope.classList.add("is-open");
      if (details) details.open = true;
      if (reveal) reveal.classList.add("is-revealed");
      scrollToId("revelacion");
    }, 880);

    later(function () {
      if (phase !== "opening") return;
      phase = "open";
      dismissSummary();
      announce("Namasté, Oihane. Nos vamos a la India.");
      focusSaludo();
      enhanceReveals(details);
      celebrate();
    }, 1680);
  }

  function replaySurprise() {
    clearTimers();
    phase = "closed";
    if (details) details.open = false;
    if (envelope) envelope.classList.remove("is-opening", "is-open");
    if (reveal) reveal.classList.remove("is-revealed");
    restoreSummary();
    var inicio = document.getElementById("inicio");
    scrollToId("inicio");
    if (inicio) {
      window.setTimeout(function () {
        inicio.focus({ preventScroll: true });
      }, prefersReduced() ? 0 : 400);
    }
    if (window.ScrollTrigger) {
      window.setTimeout(function () {
        window.ScrollTrigger.refresh();
      }, 500);
    }
  }

  if (summary && details) {
    summary.setAttribute("aria-expanded", "false");
    summary.addEventListener("click", function (event) {
      if (phase !== "closed") {
        event.preventDefault();
        return;
      }
      if (prefersReduced()) return;
      event.preventDefault();
      beginOpen();
    });

    details.addEventListener("toggle", function () {
      if (details.open && phase === "closed") finishOpen();
    });
  }

  if (envelope) {
    envelope.addEventListener("click", function () {
      if (phase !== "closed") return;
      if (prefersReduced()) {
        if (details) details.open = true;
        return;
      }
      beginOpen();
    });
  }

  document.querySelectorAll("[data-choose]").forEach(function (button) {
    button.addEventListener("click", function () {
      selectExperience(button.getAttribute("data-choose"));
    });
  });

  document.querySelectorAll("[data-explore]").forEach(function (button) {
    button.addEventListener("click", function () {
      var panel = document.getElementById(button.getAttribute("aria-controls"));
      if (!panel) return;
      var willOpen = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", willOpen ? "true" : "false");
      button.textContent = willOpen ? "Cerrar detalle" : "Explorar experiencia";
      panel.hidden = !willOpen;
      if (willOpen) {
        panel.focus({ preventScroll: true });
        scrollToId(panel.id);
      }
    });
  });

  if (copyButton) {
    copyButton.addEventListener("click", copyChoice);
  }

  if (replay) {
    replay.addEventListener("click", function (event) {
      event.preventDefault();
      replaySurprise();
    });
  }

  var stored = readPref();
  if (stored) paintChoice(stored, true);

  setupMotion();

  window.addEventListener("pageshow", function () {
    if (phase === "closed") window.scrollTo(0, 0);
  });
})();
