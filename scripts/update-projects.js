#!/usr/bin/env node
/* ============================================================
   Regenerates assets/projects.json from the GitHub API.

   Run by .github/workflows/update-projects.yml (daily), or by hand:
     node scripts/update-projects.js
   GITHUB_TOKEN is optional locally — it only raises the rate limit.
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");
const lib = require("../assets/projects-lib.js");

const OUT = path.join(__dirname, "..", "assets", "projects.json");
const USER = lib.config.user;

async function fetchRepos() {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": USER + "-portfolio" };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) headers.Authorization = "Bearer " + token;

  const all = [];
  for (let page = 1; page <= 5; page++) {
    const url = `https://api.github.com/users/${USER}/repos?per_page=100&type=owner&sort=pushed&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`);
    const batch = await res.json();
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

(async () => {
  const repos = await fetchRepos();
  const projects = lib.buildProjects(repos, lib.config);

  if (!projects.length) {
    console.error("Refusing to write an empty project list.");
    process.exit(1);
  }

  const payload = {
    user: USER,
    generated: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
    repoCount: lib.countPublicRepos(repos),
    projects
  };

  // Keep the diff readable and stable so the workflow only commits real changes.
  const previous = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : null;
  const same = previous &&
    previous.repoCount === payload.repoCount &&
    JSON.stringify(previous.projects) === JSON.stringify(payload.projects);
  if (same) {
    console.log(`No change — ${projects.length} projects, ${payload.repoCount} public repos.`);
    return;
  }

  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
  console.log(`Wrote ${projects.length} projects (${payload.repoCount} public repos) to assets/projects.json`);
  projects.forEach(p => console.log(`  ${String(p.stars).padStart(3)}★  ${p.repo}`));
})().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
