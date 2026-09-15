/* ============================================================
   projects-lib.js — one source of truth for the project grid.

   Shared by two callers:
     • scripts/update-projects.js  (Node, in GitHub Actions) → assets/projects.json
     • assets/main.js              (browser, fallback path)  → live GitHub API

   Editing the grid means editing CONFIG below — nothing else.
   ============================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ProjectsLib = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------- curation ----------
     Everything public, non-fork, non-archived and with a GitHub description
     shows up automatically. This block only decides order and wording. */
  var CONFIG = {
    user: "ialakey",

    /* How many cards the grid shows. */
    limit: 12,

    /* Never show these, whatever their stars. */
    exclude: [
      "ialakey",            // profile README
      "ialakey.github.io",  // this site
      "privacy_policy"      // legal boilerplate for the Play apps
    ],

    /* Shown first, in this order. Anything else fills the remaining
       slots by stars, then by most recently pushed. */
    pinned: [
      "caseforge",
      "resume2human",
      "shorts-factory",
      "anime-dl-core",
      "anime-watch-together",
      "srbguide",
      "driftdesertrace",
      "discordbot",
      "linguome-flutter",
      "keyboard-magic",
      "converter-libreoffice"
    ],

    /* Per-repo overrides. Every field is optional; anything missing comes
       from the GitHub API. A repo with `hide: true` is dropped. */
    repos: {
      "caseforge": {
        desc: "Open-source CS2 case-opening platform: Steam auth, provably fair openings, an RTP-balanced case builder, bot-driven withdrawals and an admin CRM.",
        badge: "Open source"
      },
      "resume2human": {
        desc: "Job hunting turned into a pipeline: scrapes vacancies, finds the decision-maker behind each one, and drives direct outreach instead of shouting into an ATS.",
        lang: "Python"
      },
      "shorts-factory": {
        desc: "Long video to vertical Shorts. Multi-signal moment scoring instead of asking an LLM what's interesting, plus a virtual camera that reframes 9:16 like a human operator."
      },
      "anime-dl-core": {
        desc: "Python library that turns player embeds from seven different hosts into direct HLS/DASH/MP4 links. One interface, a parser per provider.",
        badge: "Library"
      },
      "anime-watch-together": {
        desc: "Synced watch parties: shared player state across a room, Discord guild auth and episode tracking. FastAPI on top of anime-dl-core."
      },
      "srbguide": {
        desc: "Flutter app for expats in Serbia: visa-run calculator with reminders, white-card generator and a curated directory of local Telegram channels.",
        badge: "Google Play"
      },
      "driftdesertrace": {
        title: "Drift Desert Race",
        desc: "Unity racing game about an eight-hour non-stop drift across an endless desert. Shipped and released on Steam.",
        badge: "Steam"
      },
      "discordbot": {
        desc: "Dockerized Discord and Telegram bot with voice commands, text-to-speech and voice-channel management, documented end-to-end with Swagger UI."
      },
      "linguome-flutter": {
        title: "linguome",
        desc: "Point the camera at real-world text and it becomes vocabulary pages, spaced review and mini games. OCR to learning loop.",
        badge: "Google Play"
      },
      "keyboard-magic": {
        desc: "IntelliJ IDEA plugin that fixes text typed in the wrong keyboard layout (RU/EN) with a single shortcut. Built because it annoyed me daily.",
        badge: "JetBrains plugin"
      },
      "converter-libreoffice": {
        desc: "Kotlin + Spring Boot REST service that converts DOCX to HTML and HTML to PDF through headless LibreOffice. The unglamorous kind of backend that has to just work."
      }
    }
  };

  /* GitHub's own language colours, for the dot on each card. */
  var LANG_COLORS = {
    "Python": "#3572A5", "Java": "#b07219", "Kotlin": "#A97BFF", "Dart": "#00B4AB",
    "C#": "#178600", "TypeScript": "#3178c6", "JavaScript": "#f1e05a", "HTML": "#e34c26",
    "CSS": "#563d7c", "Go": "#00ADD8", "Rust": "#dea584", "PHP": "#4F5D95",
    "Shell": "#89e051", "C++": "#f34b7d", "C": "#555555", "Ruby": "#701516",
    "Swift": "#F05138", "Vue": "#41b883", "Jupyter Notebook": "#DA5B0B",
    "Makefile": "#427819", "Dockerfile": "#384d54", "Lua": "#000080", "SQL": "#e38c00"
  };

  function lower(s) { return String(s || "").toLowerCase(); }

  /* Turn the raw /users/:user/repos payload into cards, filtered and sorted. */
  function buildProjects(repos, config) {
    var cfg = config || CONFIG;
    var overrides = cfg.repos || {};
    var excluded = {};
    (cfg.exclude || []).forEach(function (n) { excluded[lower(n)] = true; });
    var pinOrder = {};
    (cfg.pinned || []).forEach(function (n, i) { pinOrder[lower(n)] = i; });

    var cards = (repos || []).filter(function (r) {
      if (!r || !r.name || r.private) return false;
      if (r.fork && !cfg.includeForks) return false;
      if (r.archived && !cfg.includeArchived) return false;
      if (excluded[lower(r.name)]) return false;
      var o = overrides[r.name] || {};
      if (o.hide) return false;
      // A repo with no description anywhere has nothing to say on a card.
      return Boolean(o.desc || r.description);
    }).map(function (r) {
      var o = overrides[r.name] || {};
      var lang = o.lang || r.language || null;
      return {
        repo: r.name,
        title: o.title || r.name,
        desc: o.desc || r.description,
        lang: lang,
        color: o.color || LANG_COLORS[lang] || "#8b949e",
        stars: r.stargazers_count || 0,
        badge: o.badge || null,
        url: o.url || r.html_url || "https://github.com/" + cfg.user + "/" + r.name,
        pushed: r.pushed_at || "",
        pin: lower(r.name) in pinOrder ? pinOrder[lower(r.name)] : Number.MAX_SAFE_INTEGER
      };
    });

    cards.sort(function (a, b) {
      if (a.pin !== b.pin) return a.pin - b.pin;
      if (b.stars !== a.stars) return b.stars - a.stars;
      return b.pushed.localeCompare(a.pushed);
    });

    cards = cards.slice(0, cfg.limit || 12);

    // Whoever is on top of the star chart gets the badge, unless they
    // already carry a more interesting one.
    var best = cards.reduce(function (m, c) { return c.stars > m ? c.stars : m; }, 0);
    if (best > 0) {
      for (var i = 0; i < cards.length; i++) {
        if (cards[i].stars === best && !cards[i].badge) { cards[i].badge = "Most starred"; break; }
      }
    }

    cards.forEach(function (c) { delete c.pin; delete c.pushed; });
    return cards;
  }

  /* How many public repos the profile has, forks aside — the number in the
     section lede, so it can never drift out of date again. */
  function countPublicRepos(repos) {
    return (repos || []).filter(function (r) {
      return r && !r.private && !r.fork;
    }).length;
  }

  return { config: CONFIG, langColors: LANG_COLORS, buildProjects: buildProjects, countPublicRepos: countPublicRepos };
});
