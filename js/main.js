/*
 * Loam Real Estate IQ — behaviour
 * Plain JavaScript, no build step. Depends on js/config.js and js/i18n.js.
 */
(function () {
  "use strict";

  var CONFIG = window.LOAM_CONFIG || {};
  var I18N = window.LOAM_I18N || {};
  var PROJECTS = window.LOAM_PROJECTS || [];
  var STORAGE_KEY = "loam-lang";
  var lang = "en";

  /* ---------------------------------------------------------------- utils */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function get(obj, path) {
    return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }
  function t(key) {
    var v = get(I18N[lang], key);
    if (v === undefined) v = get(I18N.en, key);
    return v === undefined ? key : v;
  }
  function pick(field) {
    if (field == null) return "";
    if (typeof field === "string") return field;
    return field[lang] || field.en || "";
  }
  function digitsOnly(s) { return String(s || "").replace(/\D/g, ""); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* --------------------------------------------------------------- config */
  function whatsappUrl(text) {
    var n = digitsOnly(get(CONFIG, "contact.whatsapp"));
    if (!n) return "";
    return "https://wa.me/" + n + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  function applyConfig() {
    $$("[data-config-href]").forEach(function (el) {
      var v = get(CONFIG, el.getAttribute("data-config-href"));
      if (v) { el.href = v; el.hidden = false; } else if (el.hasAttribute("hidden") || el.getAttribute("href") === "#") { el.hidden = true; }
    });
    $$("[data-config-text]").forEach(function (el) {
      var v = get(CONFIG, el.getAttribute("data-config-text"));
      if (v != null) el.textContent = pick(v);
    });
    $$("[data-config-show]").forEach(function (el) {
      el.hidden = !get(CONFIG, el.getAttribute("data-config-show"));
    });
    $$("[data-config-tel]").forEach(function (el) {
      var v = get(CONFIG, el.getAttribute("data-config-tel"));
      if (v) { el.textContent = v; el.href = "tel:+" + digitsOnly(v); }
    });
    $$("[data-config-mailto]").forEach(function (el) {
      var v = get(CONFIG, el.getAttribute("data-config-mailto"));
      if (v) { el.textContent = v; el.href = "mailto:" + v; }
    });
    var wa = whatsappUrl();
    $$("[data-whatsapp-link]").forEach(function (el) {
      if (wa) { el.href = wa; el.hidden = false; } else { el.hidden = true; }
    });
    var year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ----------------------------------------------------------------- i18n */
  function applyLanguage(next) {
    lang = I18N[next] ? next : "en";
    var rtl = lang === "ar";
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? "rtl" : "ltr";

    $$("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $$("[data-i18n-placeholder]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-i18n-placeholder")); });
    $$("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });

    document.title = t("meta.title");
    var desc = $('meta[name="description"]');
    if (desc) desc.setAttribute("content", t("meta.description"));

    // Config-driven text that has a language variant (e.g. the address)
    $$("[data-config-text]").forEach(function (el) {
      var v = get(CONFIG, el.getAttribute("data-config-text"));
      if (v != null && typeof v === "object") el.textContent = pick(v);
    });

    renderProjects();
    syncProjectChip();
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
  }

  function initialLanguage() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q && I18N[q]) return q;
    try { var s = localStorage.getItem(STORAGE_KEY); if (s && I18N[s]) return s; } catch (e) { /* ignore */ }
    var d = CONFIG.defaultLang;
    return I18N[d] ? d : "en";
  }

  /* ------------------------------------------------------------ portfolio */
  var activeFilter = "all";

  function categoryLabel(cat) {
    return { apartments: t("portfolio.filterApartments"), villas: t("portfolio.filterVillas"), mixed: t("portfolio.filterMixed") }[cat] || cat;
  }

  function renderProjects() {
    var grid = $("#projectsGrid");
    if (!grid) return;
    grid.innerHTML = PROJECTS.map(function (p) {
      var visual = p.image
        ? '<img src="' + escapeHtml(p.image) + '" alt="" loading="lazy">'
        : '<svg aria-hidden="true"><use href="#' + escapeHtml(p.illustration || "ill-tower") + '"/></svg>';
      var specs = (pick(p.specs) || []).map(function (s) { return "<li>" + escapeHtml(s) + "</li>"; }).join("");
      return (
        '<li class="project reveal in" data-category="' + escapeHtml(p.category) + '" data-id="' + escapeHtml(p.id) + '">' +
          '<div class="project-visual">' + visual +
            '<span class="project-tag">' + escapeHtml(categoryLabel(p.category)) + "</span>" +
          "</div>" +
          '<div class="project-body">' +
            '<span class="project-loc"><svg class="icon" aria-hidden="true"><use href="#ic-pin"/></svg>' + escapeHtml(pick(p.location)) + "</span>" +
            "<h3>" + escapeHtml(pick(p.title)) + "</h3>" +
            '<p class="project-text">' + escapeHtml(pick(p.text)) + "</p>" +
            '<ul class="project-specs">' + specs + "</ul>" +
            '<button type="button" class="text-link project-cta" data-enquire="' + escapeHtml(p.id) + '">' +
              "<span>" + escapeHtml(t("portfolio.enquire")) + "</span>" +
              '<svg class="icon icon-arrow" aria-hidden="true"><use href="#ic-arrow"/></svg>' +
            "</button>" +
          "</div>" +
        "</li>"
      );
    }).join("");
    applyFilter(activeFilter);
  }

  function applyFilter(filter) {
    activeFilter = filter;
    var shown = 0;
    $$("#projectsGrid .project").forEach(function (card) {
      var hide = filter !== "all" && card.getAttribute("data-category") !== filter;
      card.classList.toggle("is-hidden", hide);
      if (!hide) shown++;
    });
    $$("#filters .chip").forEach(function (chip) {
      var on = chip.getAttribute("data-filter") === filter;
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var empty = $("#projectsEmpty");
    if (empty) empty.hidden = shown > 0;
  }

  function initPortfolio() {
    var filters = $("#filters");
    if (filters) {
      filters.addEventListener("click", function (e) {
        var chip = e.target.closest(".chip");
        if (chip) applyFilter(chip.getAttribute("data-filter"));
      });
    }
    var grid = $("#projectsGrid");
    if (grid) {
      grid.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-enquire]");
        if (!btn) return;
        setProject(btn.getAttribute("data-enquire"));
        var contact = $("#contact");
        if (contact) contact.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(function () { var f = $("#fName"); if (f) f.focus({ preventScroll: true }); }, 600);
      });
    }
  }

  /* -------------------------------------------------------- contact form */
  var selectedProjectId = "";

  function setProject(id) {
    selectedProjectId = id || "";
    syncProjectChip();
  }

  function syncProjectChip() {
    var chip = $("#projectChip"), name = $("#projectChipName"), field = $("#projectField");
    var p = PROJECTS.filter(function (x) { return x.id === selectedProjectId; })[0];
    if (!chip) return;
    if (p) {
      chip.hidden = false;
      name.textContent = pick(p.title);
      field.value = pick(p.title);
    } else {
      chip.hidden = true;
      name.textContent = "";
      field.value = "";
    }
  }

  function initForm() {
    var form = $("#contactForm");
    if (!form) return;
    var status = $("#formStatus");
    var clear = $("#projectChipClear");
    if (clear) clear.addEventListener("click", function () { setProject(""); });

    function setStatus(msg, isError) {
      status.textContent = msg;
      status.classList.toggle("is-error", !!isError);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = String(data.get("name") || "").trim();
      var phone = String(data.get("phone") || "").trim();
      var message = String(data.get("message") || "").trim();
      var interestEl = $("#fInterest");
      var interest = interestEl ? interestEl.options[interestEl.selectedIndex].text : "";
      var project = String(data.get("project") || "").trim();

      $$(".field", form).forEach(function (f) { f.classList.remove("is-invalid"); });
      if (!name || !phone) {
        if (!name) $("#fName").closest(".field").classList.add("is-invalid");
        if (!phone) $("#fPhone").closest(".field").classList.add("is-invalid");
        setStatus(t("form.invalid"), true);
        return;
      }

      var lines = [
        t("form.msgIntro"),
        "",
        t("form.name") + ": " + name,
        t("form.phone") + ": " + phone,
        t("form.interest") + ": " + interest
      ];
      if (project) lines.push(t("form.project") + ": " + project);
      if (message) lines.push("", message);
      var text = lines.join("\n");

      var wa = whatsappUrl(text);
      var email = get(CONFIG, "contact.email");
      var handle = get(CONFIG, "social.instagramHandle");

      if (wa) {
        setStatus(t("form.openingWhatsapp"));
        window.open(wa, "_blank", "noopener");
      } else if (email) {
        setStatus(t("form.openingEmail"));
        var subject = (CONFIG.brand && CONFIG.brand.name ? CONFIG.brand.name + " — " : "") + (project || interest);
        window.location.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      } else {
        var ig = "https://ig.me/m/" + encodeURIComponent(handle || "loam.iq");
        var done = function (ok) {
          setStatus(ok ? t("form.copied") : t("form.copyFailed"));
          window.open(ig, "_blank", "noopener");
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
        } else {
          done(false);
        }
      }
    });
  }

  /* ----------------------------------------------------------- navigation */
  function initNav() {
    var header = $("#siteHeader");
    var burger = $("#navBurger");
    var nav = $("#nav");

    function onScroll() { header.classList.toggle("scrolled", window.scrollY > 24); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    function closeMenu() {
      document.body.classList.remove("nav-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", t("menuOpen"));
    }
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", t(open ? "menuClose" : "menuOpen"));
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 960) closeMenu(); });

    // Highlight the section in view
    var links = $$(".nav-list a");
    var sections = links.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);
    if ("IntersectionObserver" in window && sections.length) {
      var current = null;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) current = en.target.id;
        });
        links.forEach(function (a) { a.classList.toggle("is-current", a.getAttribute("href") === "#" + current); });
      }, { rootMargin: "-40% 0px -55% 0px" });
      sections.forEach(function (s) { io.observe(s); });
    }

    var toggle = $("#langToggle");
    toggle.addEventListener("click", function () {
      applyLanguage(lang === "ar" ? "en" : "ar");
      closeMenu();
    });
  }

  /* --------------------------------------------------------------- reveal */
  function initReveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------------- init */
  document.addEventListener("DOMContentLoaded", function () {
    applyConfig();
    applyLanguage(initialLanguage());
    initPortfolio();
    initForm();
    initNav();
    initReveal();
  });
})();
