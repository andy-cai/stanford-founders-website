# Stanford Founders' Club Website

Official website for Stanford Founders, Stanford's graduate entrepreneurship community.
Live at [https://stanfordfounders.stanford.edu](https://stanfordfounders.stanford.edu).

## Repositories

The live site deploys from **`AdvitDeepak/stanford-founders-website`** (`main`). `andy-cai/stanford-founders-website`
is a fork used for development. Before starting new work on the fork, sync it with upstream so you are not building on
stale files:

```bash
git fetch https://github.com/AdvitDeepak/stanford-founders-website main
git checkout main && git merge --ff-only FETCH_HEAD && git push origin main
```

## How the site is built

Plain HTML, CSS, and JavaScript. No build step, no dependencies.

| Path | What it is |
| --- | --- |
| `index.html`, `about.html`, `events.html`, `services.html`, `contact.html` | The public pages |
| `team.html` | Hidden for now (not linked, `noindex`). See "Team page" below |
| `header.html`, `footer.html` | Shared header (utility bar, nav, mobile menu) and footer, injected at runtime by `static/js/components.js` |
| `static/css/styles.css` | Brand system (Stanford identity palette, Source Serif 4 / Source Sans 3) plus the editorial component layer at the bottom. Page-specific styles live in each page's `<style>` |
| `static/js/components.js` | Header/footer injection, active nav link, mobile menu, scroll reveals, contact form wiring |
| `assets/logo/` | SFC logo set. `SFC_White.svg` is used on cardinal/ink grounds, `SFC_Cardinal.svg` on light grounds |
| `images/events/` | Event photography. Keep new photos at most ~1800px wide and under ~300 KB (JPEG) |
| `images/logos/sponsors/`, `images/logos/investors/` | Partner logos shown on the Events page |
| `images/headshots/` | Team and testimonial headshots |

Because the header and footer are fetched at runtime, open the site through a local server rather than
double-clicking the HTML files:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Things you will want to update

- **Join / membership form:** search for `forms.gle` and replace every occurrence (header, footer, and page buttons).
- **Next Demo Day:** currently "May 2027". Search for `May 2027` (header utility bar, mobile menu, footer, Home,
  Services, and the `#demo-day` section on `events.html`). Add the date, venue, and RSVP link on `events.html` when known.
- **Events calendar:** all Events links point to `https://luma.com/stanford-founders-events`.
- **Contact email:** stanfordfounders@stanford.edu appears in the footer, Contact page, and `components.js` error text.
- **Stats** (members, Demo Day figures): on `index.html`, `about.html`, and `events.html`.

### Team page

`team.html` is kept in the repo but hidden until the roster is refreshed. To bring it back:

1. Update the names, roles, and headshots in `team.html`.
2. Remove the `<meta name="robots" content="noindex, nofollow">` line from `team.html`.
3. Un-comment the Team link in `header.html` (both the desktop `.links` and the `.mobile-nav`).

## Deploying

1. Clone and edit locally
   ```bash
   git clone https://github.com/AdvitDeepak/stanford-founders-website.git
   cd stanford-founders-website
   ```
2. Test with `python3 -m http.server 8000`
3. Commit and push to `main` (or open a pull request from the fork)
4. Pull on the server: open [https://domains.stanford.edu/dashboard/](https://domains.stanford.edu/dashboard/),
   click **Terminal**, then
   ```bash
   cd stanfordfounders.stanford.edu
   git pull
   ```
   Whatever is in that folder is what is served.

## Contact form

The contact form posts to a Google Apps Script that appends rows to a spreadsheet in the Stanford Founders shared
drive: `2025-2026 / Website / Contact Form Submissions` (timestamp, first name, last name, email, message).
The script URL is set in `contact.html` (`window.SFS_FORM_ENDPOINT`) before `components.js` loads.

## License

© Stanford Founders' Club. Stanford™ is a trademark of The Board of Trustees of the Leland Stanford Junior University.
