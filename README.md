# Summit Peak website concept

A responsive property management site built with HTML, CSS, browser JavaScript, and a dependency-free Node server.

## Run locally

Use Node.js 20 or newer. In PowerShell:

```powershell
npm.cmd run dev
```

Open http://localhost:4346. The server listens on IPv4 and IPv6 loopback. Stop with Ctrl+C. If the port is occupied, stop the existing project server first.

## Content and launch status

### Deferred email and Formspree setup (September 12, 2026)

The user is waiting for the domain transfer to Squarespace to finalize. Resume email and form-delivery setup after that transfer; Squarespace is the planned domain registrar, and website hosting has not been selected by this decision.

- The user prefers Formspree for website submissions. No Formspree endpoint has been supplied or connected.
- Zoho Mail is the likely email provider because the user already uses it. The intended setup gives Darryl his own Zoho account with organized contact, maintenance, and inquiry email channels.
- Planned addresses are `contact@summitpeakpm.com`, `maintenance@summitpeakpm.com`, and `inquiries@summitpeakpm.com`. The mailbox/alias structure and final routing remain to be decided after the transfer.
- The proposed Formspree setup is one website inquiry endpoint with audience, topic, and source-page fields. A dedicated inquiries destination was recommended; the final recipient and any maintenance routing remain unconfigured.
- Once email is ready, verify the recipient in Formspree, connect the supplied endpoint to the website forms, update the privacy notice and discovery documentation, and verify delivery. General inquiry forms should continue to direct urgent maintenance to the confirmed resident emergency instructions.

This records future work only. The existing local inquiry storage remains active, and no DNS, email-account, or delivery changes have been made.

The original summitpeakpm.com website was blocked by the research environment's network filter. The design is original. Business facts were subsequently supplied by the user: Darryl Champion owns and operates Summit Peak, served in the U.S. Army during Desert Storm, and has more than a decade of Colorado Springs real estate experience. The user also supplied veteran-owned status, owner/renter communication, careful screening, and the one-month rent-protection benefit. Coverage questions are directed to Summit Peak; eligibility, exclusions, payment timing, and legal outcomes are not invented. No stock image is presented as Darryl or an available rental.

The local inquiry endpoint validates submissions and saves them to `data/inquiries.jsonl`, outside the public directory. It does not email anyone or connect to a CRM. Connect an approved contact destination and production storage, add abuse protection, update the privacy notice for the launch setup, and verify the actual services and resident portal before public launch. Only loopback addresses are served by the local development server.

The navigation, service dialogs, FAQ accordion, interest selection, and contact form work without a framework. Assets are served locally except optional Google Fonts; system fonts are the fallback.

## Readability and search information

The compact header uses `public/header.css` (September 21, 2026): one 72px sticky row on desktop and 64px on mobile, with the brand, phone number, and menu button. Navigation, veteran-owned text, and the audience switch are inside the dropdown on all screen sizes. The menu closes on outside clicks, Escape, link selection, and keyboard focus moving outside. Shared-page navigation preserves the audience-switch controls when adapting to a saved experience. Header and article scroll offsets match the shorter row.

`public/readability.css` contains the larger text sizes, contrast improvements, flexible hero layout, and service-area styling. Body copy is generally 16–18px, with larger labels and controls. Reduced-motion preferences remain supported.

The page title, description, social metadata, visible headings, and Organization JSON-LD describe property management in Colorado Springs and El Paso County. The service area, phone, and email were supplied by the owner. Nearby community names were checked against El Paso County sources. No street address, business hours, ratings, or reviews are fabricated.

The confirmed production hostname is `https://www.summitpeakpm.com`. Canonical URLs, social page URLs, sitemap entries, and discovery links use that origin. The local contact form still saves inquiries locally and does not send email.

References: https://developers.google.com/search/docs/fundamentals/seo-starter-guide and https://assessor.elpasoco.com/tax-entity-maps/incorporated-cities-towns/.

## Pages and editing

Champ Real Estate cross-links were added September 13, 2026, at the user's request. `site/realestate.cjs` holds the destination `https://champrealestate.org/` and the buying/selling section copy. Sections appear on the overview, renter, owner, and About pages, with contextual renter/owner FAQ answers and a footer link on every page. Links open the other business's website in the current tab. The relationship is described in llms.txt; the external site is not added to Summit Peak's sitemap. The external destination could not be verified by the research browser during implementation.

- `/`: homepage, owner and renter paths, founder introduction, military support, rent-protection summary, contact form.
- `/renters/`: renter homepage with rental search, application guidance, resident support, and a renter-specific inquiry form. Dedicated `/renters/faq/`, `/renters/guides/`, and `/renters/military/` pages continue that experience.
- `/owners/`: landlord homepage with management services, renter screening, communication, rent protection, and an owner-specific inquiry form. Dedicated `/owners/faq/`, `/owners/guides/`, and `/owners/military/` pages continue that experience.
- `/about/`: owner background and company approach.
- `/military/`: military-owner and renter paths with official resources.
- `/faq/`: searchable questions with topic filters and deep links.
- `/guides/`: four original articles with topic filters, reading navigation, related articles, and linked official sources.
- `/privacy/`: website privacy notice, including current preview storage, retention, Google Fonts, and privacy-request contacts.

Edit overview homepage content in `site/home.html` and homepage additions/shared templates in `site/build.cjs`. Edit the renter and owner experiences, selector, and topic selections in `site/audiences.cjs`. Edit questions and articles in `site/content.cjs`. Run `npm.cmd run build` to regenerate public HTML. Startup and test scripts also build automatically. Keep generated HTML in the project so the public directory can be hosted statically once the inquiry endpoint is connected to a production service.

The opening dialog offers renter and owner/landlord paths. `public/audience.js` remembers the choice in session storage for the tab, routes a returning homepage visit to the chosen experience, and keeps shared-page navigation relevant. Direct audience URLs take precedence over an earlier choice. Visitors can switch at any time, close the selector, or choose the main site; the privacy notice never automatically opens the selector. Native dialog behavior supports keyboard focus and Escape. Dedicated pages and overview choice links also work without JavaScript. `public/audience.css` styles the selector and audience pages; `public/audience-state.js` provides guarded storage and link mapping. The privacy notice describes this tab-level preference storage.

`public/navigation.js` is shared across pages. `public/app.js` handles the overview homepage service dialogs and inquiry form; `public/inquiry.js` handles the focused homepages' inquiry forms. `public/resources.js` adds Q&A search, topic filtering, and opening a question linked by its URL fragment. All article text and Q&A content are included in HTML and remain available without JavaScript.

Run `npm.cmd test` for page routes, slash redirects, internal links, anchors, metadata parsing, local assets, and inquiry validation/persistence. Browser visual testing was unavailable in the session; review desktop and mobile rendering in the preview before launch.

## Sitemap and LLM discovery

Every build generates:

- `/sitemap.xml`: all eighteen public HTML pages, without asset, API, fragment, or Markdown duplicates. Modification dates are omitted rather than guessed.
- `/robots.txt`: public crawling directives, an API exclusion, and the sitemap URL. This is not access control.
- `/llms.txt`: detailed business context, audience and service descriptions, service area, contact channels, rent-protection boundaries, and annotated links to all pages and official resources.
- `/index.md` and each page's `/index.md`: readable versions of the public page content, generated from the same HTML. Forms and scripts are omitted; private submissions are never read.

HTML pages expose canonical links, a `rel="describedby"` link to llms.txt, and a `rel="alternate"` link to their Markdown version. The server serves text, Markdown, and XML with appropriate content types. Sitemap membership comes from routes built by `site/build.cjs`, so new generated pages are included automatically.

Edit the business context in `site/discovery.cjs`. The production origin defaults to `https://www.summitpeakpm.com` in `site/config.cjs`. To build for a different origin, set `SITE_URL` before running the build; only an HTTP(S) origin without credentials, a path, query, or fragment is accepted.

```powershell
$env:SITE_URL = 'https://www.summitpeakpm.com'
npm.cmd run build
```

The files are prepared locally; no sitemap has been submitted to a search engine and the live Wix site has not been changed. llms.txt follows the proposal at https://llmstxt.org/; it does not guarantee adoption by assistants or a ranking change.

## Privacy notice

Edit the notice in `site/privacy.cjs` and rebuild. The revision date is explicit and should change when the notice is revised, not on every build. Links appear beside the contact form and in every page's footer. The privacy page and Markdown version are included automatically in the sitemap and llms.txt.

The notice describes the current implementation rather than promising unconfigured privacy practices: inquiries stay on the preview server, there is no automatic deletion schedule, no email or CRM forwarding is configured, and Google Fonts makes external browser requests. Confirm actual hosting/logging, service providers, access, retention, and request-handling practices before launch and update the notice accordingly. No cookie consent or advertising-consent workflow has been added because this version has no analytics or advertising scripts. No representation of comprehensive legal compliance is made.

Photo sources: https://images.unsplash.com/photo-1600596542815-ffad4c1539a9 and https://images.unsplash.com/photo-1600210492486-724fe5c67fb0. Photos are illustrative and do not represent managed properties. Use approved brand photography before launch.
"# Summitpeakpm" 
