/* ============================================================
   ialakey.github.io — portfolio behaviour
   No dependencies. Everything degrades gracefully.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- projects ----------
     Cards come from assets/projects.json, regenerated daily by
     .github/workflows/update-projects.yml. If that file is missing (opened
     over file://, or the workflow has never run) we ask the GitHub API
     directly and build the same list in the browser. Curation for both
     paths lives in assets/projects-lib.js. */
  var LIB = window.ProjectsLib;
  var GH_USER = (LIB && LIB.config.user) || "ialakey";

  var STAR_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .25l2.06 4.36 4.69.69-3.4 3.4.8 4.8L8 11.25l-4.15 2.25.8-4.8-3.4-3.4 4.69-.69z"/></svg>';

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function getJSON(url) {
    return fetch(url).then(function (r) {
      return r.ok ? r.json() : Promise.reject(new Error(url + " -> " + r.status));
    });
  }

  function loadProjects() {
    return getJSON("assets/projects.json")
      .then(function (data) {
        if (!data || !data.projects || !data.projects.length) throw new Error("empty");
        return data;
      })
      .catch(function () {
        // Live fallback: same filtering and ordering, done client-side.
        if (!LIB) return { projects: [] };
        return getJSON("https://api.github.com/users/" + GH_USER + "/repos?per_page=100&type=owner&sort=pushed")
          .then(function (repos) {
            return {
              projects: LIB.buildProjects(repos, LIB.config),
              repoCount: LIB.countPublicRepos(repos)
            };
          })
          .catch(function () { return { projects: [] }; });
      });
  }

  function projectCard(p) {
    return (
      '<a class="proj reveal" href="' + esc(p.url || ("https://github.com/" + GH_USER + "/" + p.repo)) + '"' +
      ' target="_blank" rel="noopener">' +
        '<div class="proj-top">' +
          '<span class="proj-name">' + esc(p.title || p.repo) + '</span>' +
          '<span class="proj-stars loaded" data-repo="' + esc(p.repo) + '">' +
            STAR_SVG + '<span class="proj-star-count">' + esc(p.stars || 0) + '</span>' +
          '</span>' +
        '</div>' +
        '<p class="proj-desc">' + esc(p.desc) + '</p>' +
        '<div class="proj-foot">' +
          (p.lang ? '<span class="proj-lang"><i style="background:' + esc(p.color || "#8b949e") + '"></i>' + esc(p.lang) + '</span>' : '') +
          (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '') +
        '</div>' +
      '</a>'
    );
  }

  function renderProjects(data) {
    var grid = document.getElementById("projects-grid");
    if (!grid) return;

    var projects = (data && data.projects) || [];
    if (!projects.length) {
      // Nothing to show beats a broken-looking empty box; the section still
      // has its "All repositories on GitHub" link underneath.
      grid.innerHTML = '<p class="proj-empty">Project list is on ' +
        '<a href="https://github.com/' + GH_USER + '?tab=repositories" target="_blank" rel="noopener">GitHub</a>.</p>';
      return;
    }

    grid.innerHTML = projects.map(projectCard).join("");

    var count = document.getElementById("repo-count");
    if (count && data.repoCount) count.textContent = data.repoCount;

    setupReveal(grid.querySelectorAll(".proj"));
    refreshStars();
  }

  /* ---------- live star counts ----------
     projects.json is at most a day old; this corrects it in place. One
     unauthenticated request, and if GitHub rate-limits us the rendered
     numbers simply stay as they are. */
  function refreshStars() {
    getJSON("https://api.github.com/users/" + GH_USER + "/repos?per_page=100&type=owner&sort=pushed")
      .then(function (repos) {
        if (!Array.isArray(repos)) return;
        var byName = {};
        repos.forEach(function (r) { byName[r.name] = r.stargazers_count; });
        document.querySelectorAll(".proj-stars").forEach(function (el) {
          var n = byName[el.dataset.repo];
          if (typeof n === "number") el.querySelector(".proj-star-count").textContent = n;
        });
      })
      .catch(function () { /* keep the numbers we already have */ });
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

  /* ---------- scroll reveal + counters ----------
     The project cards arrive after the fetch resolves, so the reveal
     observer is kept around and fed new nodes as they are rendered. */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canObserve = !reduced && "IntersectionObserver" in window;
  var revealObs = null;

  function setupReveal(nodes) {
    nodes = Array.prototype.slice.call(nodes);
    nodes.forEach(function (el) { el.classList.add("reveal"); });

    if (!canObserve) {
      nodes.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    if (!revealObs) {
      revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e, i) {
          if (!e.isIntersecting) return;
          setTimeout(function () { e.target.classList.add("in"); }, Math.min(i * 55, 280));
          revealObs.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    }
    nodes.forEach(function (el) { revealObs.observe(el); });
  }

  function setupObservers() {
    setupReveal(document.querySelectorAll(".card, .tl-item, .fact, .stack-col, .clink, .panel"));

    if (!canObserve) {
      document.querySelectorAll(".num").forEach(function (el) {
        var d = parseInt(el.dataset.decimals || "0", 10);
        var n = parseFloat(el.dataset.count);
        el.textContent = (d ? n.toFixed(d) : n.toLocaleString("en-US")) + (el.dataset.suffix || "");
      });
      return;
    }

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
  setupObservers();
  setupNav();
  setupCardGlow();
  setupTheme();
  loadProjects().then(renderProjects);
})();
