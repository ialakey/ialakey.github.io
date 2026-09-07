/* ============================================================
   ialakey.github.io — portfolio behaviour
   No dependencies. Everything degrades gracefully.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- curated projects ----------
     `stars` is a fallback used until (or if) the GitHub API answers. */
  var PROJECTS = [
    {
      repo: "resume2human",
      title: "resume2human",
      desc: "Job hunting turned into a pipeline: scrapes vacancies, finds the decision-maker behind each one, and drives direct outreach instead of shouting into an ATS.",
      lang: "Python", color: "#3572A5", stars: 8, badge: "Most starred"
    },
    {
      repo: "shorts-factory",
      title: "shorts-factory",
      desc: "Long video to vertical Shorts. Multi-signal moment scoring instead of asking an LLM what's interesting, plus a virtual camera that reframes 9:16 like a human operator.",
      lang: "Python", color: "#3572A5", stars: 6
    },
    {
      repo: "discordbot",
      title: "discordbot",
      desc: "Dockerized Discord and Telegram bot with voice commands, text-to-speech and voice-channel management, documented end-to-end with Swagger UI.",
      lang: "Java", color: "#b07219", stars: 3
    },
    {
      repo: "anime-dl-core",
      title: "anime-dl-core",
      desc: "Python library that turns player embeds from seven different hosts into direct HLS/DASH/MP4 links. One interface, a parser per provider.",
      lang: "Python", color: "#3572A5", stars: 2, badge: "Library"
    },
    {
      repo: "srbguide",
      title: "srbguide",
      desc: "Flutter app for expats in Serbia: visa-run calculator with reminders, white-card generator and a curated directory of local Telegram channels.",
      lang: "Dart", color: "#00B4AB", stars: 2, badge: "Google Play"
    },
    {
      repo: "driftdesertrace",
      title: "Drift Desert Race",
      desc: "Unity racing game about an eight-hour non-stop drift across an endless desert. Shipped and released on Steam.",
      lang: "C#", color: "#178600", stars: 1, badge: "Steam"
    },
    {
      repo: "keyboard-magic",
      title: "keyboard-magic",
      desc: "IntelliJ IDEA plugin that fixes text typed in the wrong keyboard layout (RU/EN) with a single shortcut. Built because it annoyed me daily.",
      lang: "Kotlin", color: "#A97BFF", stars: 0, badge: "JetBrains plugin"
    },
    {
      repo: "converter-libreoffice",
      title: "converter-libreoffice",
      desc: "Kotlin + Spring Boot REST service that converts DOCX to HTML and HTML to PDF through headless LibreOffice. The unglamorous kind of backend that has to just work.",
      lang: "Kotlin", color: "#A97BFF", stars: 1
    },
    {
      repo: "linguome-flutter",
      title: "linguome",
      desc: "Point the camera at real-world text and it becomes vocabulary pages, spaced review and mini games. OCR to learning loop.",
      lang: "Dart", color: "#00B4AB", stars: 2, badge: "Google Play"
    }
  ];

  var STAR_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .25l2.06 4.36 4.69.69-3.4 3.4.8 4.8L8 11.25l-4.15 2.25.8-4.8-3.4-3.4 4.69-.69z"/></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- render project grid ---------- */
  function renderProjects() {
    var grid = document.getElementById("projects-grid");
    if (!grid) return;

    grid.innerHTML = PROJECTS.map(function (p) {
      return (
        '<a class="proj reveal" href="https://github.com/ialakey/' + esc(p.repo) + '"' +
        ' target="_blank" rel="noopener">' +
          '<div class="proj-top">' +
            '<span class="proj-name">' + esc(p.title) + '</span>' +
            '<span class="proj-stars" data-repo="' + esc(p.repo) + '">' +
              STAR_SVG + '<span class="proj-star-count">' + p.stars + '</span>' +
            '</span>' +
          '</div>' +
          '<p class="proj-desc">' + esc(p.desc) + '</p>' +
          '<div class="proj-foot">' +
            '<span class="proj-lang"><i style="background:' + esc(p.color) + '"></i>' + esc(p.lang) + '</span>' +
            (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '') +
          '</div>' +
        '</a>'
      );
    }).join("");

    // Fallback counts are already correct, so show them immediately;
    // the live fetch below only corrects them.
    grid.querySelectorAll(".proj-stars").forEach(function (el) { el.classList.add("loaded"); });
  }

  /* ---------- live star counts ----------
     One unauthenticated request; if GitHub rate-limits us the static
     numbers above stay on screen and nothing looks broken. */
  function refreshStars() {
    fetch("https://api.github.com/users/ialakey/repos?per_page=100&sort=updated")
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (repos) {
        if (!Array.isArray(repos)) return;
        var byName = {};
        repos.forEach(function (r) { byName[r.name] = r.stargazers_count; });
        document.querySelectorAll(".proj-stars").forEach(function (el) {
          var n = byName[el.dataset.repo];
          if (typeof n === "number") el.querySelector(".proj-star-count").textContent = n;
        });
      })
      .catch(function () { /* keep the static counts */ });
  }

  /* ---------- animated metric counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || "0", 10);
    var suffix = el.dataset.suffix || "";
    var duration = 1100;
    var start = performance.now();

    function frame(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var value = target * eased;
      el.textContent = (decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-US")) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- scroll reveal + counters ---------- */
  function setupObservers() {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var revealTargets = document.querySelectorAll(
      ".card, .tl-item, .proj, .fact, .stack-col, .clink, .panel"
    );
    revealTargets.forEach(function (el) { el.classList.add("reveal"); });

    if (reduced || !("IntersectionObserver" in window)) {
      revealTargets.forEach(function (el) { el.classList.add("in"); });
      document.querySelectorAll(".num").forEach(function (el) {
        var d = parseInt(el.dataset.decimals || "0", 10);
        var n = parseFloat(el.dataset.count);
        el.textContent = (d ? n.toFixed(d) : n.toLocaleString("en-US")) + (el.dataset.suffix || "");
      });
      return;
    }

    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        setTimeout(function () { e.target.classList.add("in"); }, Math.min(i * 55, 280));
        revealObs.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealTargets.forEach(function (el) { revealObs.observe(el); });

    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        animateCount(e.target);
        countObs.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll(".num").forEach(function (el) { countObs.observe(el); });
  }

  /* ---------- nav: shadow + active section ---------- */
  function setupNav() {
    var nav = document.querySelector(".nav");
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute("href")); })
      .filter(Boolean);

    function onScroll() {
      nav.classList.toggle("scrolled", window.scrollY > 8);
      var pos = window.scrollY + 120;
      var atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 80;
      var current = null;
      if (atBottom && sections.length) {
        current = sections[sections.length - 1].id;
      } else {
        sections.forEach(function (s) { if (s.offsetTop <= pos) current = s.id; });
      }
      links.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current);
      });
    }

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { onScroll(); ticking = false; });
    }, { passive: true });
    onScroll();
  }

  /* ---------- pointer-tracking glow on cards ---------- */
  function setupCardGlow() {
    if (window.matchMedia("(hover: none)").matches) return;
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- theme ---------- */
  function setupTheme() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
    });
  }

  /* ---------- boot ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
  renderProjects();
  setupObservers();
  setupNav();
  setupCardGlow();
  setupTheme();
  refreshStars();
})();
