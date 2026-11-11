# Project research and portfolio scan (2026-11-10)

For: Sebastian, aiming at junior QA, data and developer roles (written, async work). By Fable 5.2, from a web scout, two follow-up searches and a read-only scan of his project folders. Claims marked *(checked)* were verified by Fable; the rest come from the scan or from search snippets.

## 1. Fix first (all other repos, not this one)

| # | What | Why | Effort |
| --- | --- | --- | --- |
| 1 | **Ingresos App: remove the real restaurant figures** from `README.md` (it names a real receipt number and amount) and from the `probar_*.py` scripts; replace them with synthetic numbers. | The `ingresos-app` repo is **public** on GitHub *(checked)*; it shows a client's sales data. If the figures are already pushed, they stay in the git history: ask before rewriting it. | 20 min, plus history clean-up if needed |
| 2 | **Minoscreto: CI, LICENSE and a README top section** (screenshot, live link, "115 tests", how to run). | It has about 115 tests in 10 files but no CI, no LICENSE and a 25-line README *(checked: no `.github`, no LICENSE)*. A green test badge is the 30-second QA signal. | 1.5 h |
| 3 | **Main portfolio skills match real projects.** Angular, Java/Spring Boot, MySQL and Docker are listed *(checked)*; link the public `ClassRoomAPIV2` repo (and any Docker use) as proof, or drop what has none. | Recruiters and interviewers ask about every listed skill; tutorial-level claims hurt. | 15–30 min |
| 4 | **Main portfolio README** (it is 2 lines) and focus/reduced-motion styles. | Engineering reviewers open GitHub first. | 15 min + 1–2 h |
| 5 | **Whisker Gacha in its own repo** with a README and screenshot; keep the two WhatsApp photos in `ref/` out of it. Later, move the pity/50-50 logic into a module with tests. | Its "Code" link now points into the portfolio repo. Tested probability logic is a strong QA/dev talking point. | 1 h, then 2–3 h |
| 6 | **Formato Médico: 3 Vitest tests** (PDF field positions, CIE-10 search) and a screenshot in the README. Its Android CI already exists. | The repo is private, so recruiters only see the case study; tests still matter for interviews. | 2.5 h |
| 7 | **Data science: one pytest smoke test per project and a LICENSE.** | The READMEs are already the strongest (clear results, honest baselines); tests close the gap. | 2 h |
| 8 | **Ingresos App: turn 5–6 `probar_*.py` scripts into a pytest suite.** | About 30 one-off scripts and no runnable suite. | 3 h |

## 2. New project ideas (pick at most two)

Sources agree: a few finished, deployed projects that match the target role, each with a README that states the problem, the result and how to run it, beat many tutorial clones. Todo, Netflix and Spotify clones read as "tutorial follower".

| Idea | Role | Why it fits him | Effort |
| --- | --- | --- | --- |
| **Test this 3D portfolio in public**: Playwright smoke tests + `@axe-core/playwright` accessibility checks in GitHub Actions, with a "How this site is tested" link on the cover. | QA | Turns his own showcase into QA evidence; a 3D site with automated a11y tests is rare. Already planned as PLAN tasks 10, 11 and 14. | 1–2 days |
| **API test suite for a public API** (e.g. the NYC 311 or NASA APIs he already used): test plan, Postman/pytest tests, contract checks, CI report. | QA | Reuses APIs from his own projects; shows test design, not just tests. | 3–5 days |
| **Messy Colombian public data, cleaned and explained** (datos.gov.co): problem → cleaning log → analysis → one recommendation, with SQL. | Data | Data cleaning is the most under-represented junior skill; local data is a natural talking point in Colombian interviews. | 3–5 days |
| **One small dashboard with a stated business question** (restaurant sales from synthetic Ingresos-style data). | Data | Builds on the Ingresos domain without exposing real data. | 3–4 days |
| **One merged PR to an open-source project** (docs, a test, or an a11y fix). | Dev/QA | Often valued above several solo projects; also shows written, async collaboration. | 1–3 days |

## 3. Standout techniques worth one small demo

- Accessibility testing in CI (axe-core inside Playwright) plus a short manual screen-reader note (NVDA): the clearest "accessibility-first" signal.
- Honest evaluation write-ups (what lost, what baseline won), as his data science READMEs already do: keep that voice everywhere.
- Not found in this pass: Colombia-specific recruiter preferences, LLM-evaluation and data-storytelling examples. Research them before choosing a third project.

## 4. What this means for Planets of Code

- New PLAN task 14: GitHub Actions CI for this repo (build + smoke test + axe), and a "How this site is tested" link.
- When fixes 1–2 above are done, the Minoscreto and Ingresos cards can mention "115 tests" and "pytest suite".
- No route change needed: the planet picks already match the strongest projects.

## Sources

- QA portfolio projects (snippet): https://testlikeagirl.com/career-transition/qa-portfolio-projects-impress-hiring-managers/
- Data analyst projects, data cleaning (snippets): https://www.dataquest.io/blog/data-analyst-projects-for-beginners/ · https://d8a.academy/blog/data-analyst-portfolio-project-ideas · https://staragile.com/blog/data-analytics-portfolio
- Junior developer portfolio (snippets): https://www.webportfolios.dev/blog/junior-developer-portfolio-guide-2025 · https://dev.to/__be2942592/how-to-build-a-developer-portfolio-that-actually-gets-you-hired-2026-6kn · https://hyperskill.org/blog/post/building-a-developer-portfolio-in-2026-what-actually-gets-attention
- Portfolio mistakes, tutorial clones, exposed secrets (snippet): https://lyrid.io/post/5-critical-software-engineer-portfolio-mistakes-that-junior-developers-are-making · https://ntc.it.com/blog/hiring-managers-portfolio
- Case-study structure: https://blog.teamtreehouse.com/portfolio-projects-for-entry-level-data-roles · https://brainstation.io/career-guides/data-analyst-portfolio
- Playwright + axe: https://qaskills.sh/blog/playwright-accessibility-testing-guide-2026 · https://labs.thisdot.co/blog/testing-accessibility-features-with-playwright
