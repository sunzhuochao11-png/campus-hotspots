# My Campus Hotspots

A small website introducing three places on my campus that I visit when I want to take a break from studying.

## Pages

- `index.html` — front page with three place cards
- `canteen.html` — the school canteen
- `classroom.html` — our classroom
- `teaching-building.html` — the main teaching building

## Setup / Deploy

- All styling lives in a single `styles.css`.
- Deployed with GitHub Pages.

## Week 3 — four pages, four moods

Linked a single external stylesheet (`styles.css`) to all four HTML pages and gave each page a distinct mood while keeping the same single-column centred layout.

- **Front page** — travel-guide mood: warm paper background, large title, generous spacing.
- **Canteen** — cozy dining mood: warm cream background with soft rounded panels.
- **Classroom** — clean-and-bright mood: cool paper background with crisp straight borders.
- **Teaching Building** — scholarly mood: deep navy background, gold accent, serif headings.

### Mobile style

One `@media (max-width: 600px)` rule adjusts padding, title size, and turns map links into full-width buttons on smaller screens. A print rule also removes decorative styles.

### Sources

- Photos: taken by myself.
- Map links: Google Maps.
- Information: Google.

## Week 4 — JavaScript and the DOM

This week turns the three places into one interactive explorer, adds a data page, and adds a small canvas game. Everything lives in the `week4/` folder; the earlier weekly pages stay untouched.

- `week4/index.html` — **Practice 1: one explorer screen.** Three buttons switch the visible place section and the Google Maps iframe at the same time, with no page reload. `week4/styles.css` and `week4/app.js` keep the CSS and JavaScript separate.
- `week4/statistics.html` — **Practice 2: two views of one dataset.** Reads `week4/data/population.csv` with Papa Parse and draws two Chart.js charts behind two tabs: a line chart (South Korea vs Japan, 1960–2024) and a bar chart (ten most populous countries, 2024), each with its own interpretation and source link.
- `week4/game.html` — **Practice 3: a small canvas game.** "Star Catcher" — move a basket with the mouse or a finger to catch falling stars and dodge rocks for 30 seconds. It has score, lives, a timer, a game-over result, and a restart button.

### How the data page works

The CSV comes from [DataHub](https://datahub.io/core/population) (original source: the World Bank). It has the columns `Country Name`, `Country Code`, `Year`, and `Value`, one row per country per year from 1960 to 2024. The line chart filters the `KOR` and `JPN` rows and maps `Year -> x` and `Value -> y`; the bar chart keeps only the `Year === "2024"` rows for a fixed list of ten country codes, so aggregate rows such as "World" never appear.

### Game improvement

After the first playable version, I slowed the starting fall speed and made the objects speed up gradually as the round goes on, so the game feels fair at the start and harder near the end. I also scaled the basket position from the pointer's screen coordinates using `getBoundingClientRect` so touching anywhere on the canvas on mobile maps correctly.

### AI assistance

I used an AI assistant (Copilot/TRAE) while building this week. One representative question I asked: *"Read `population.csv` with Papa Parse and draw a line chart of KOR and JPN per year, plus a bar chart of the top ten countries in 2024, behind two tabs."* The assistant drafted the code; I checked the CSV columns by hand, verified a few chart values against the raw numbers in the file, and typed the interpretations myself after comparing the figures.