GATE: OPEN 16 (rounds used up)

# Mac / Teal verification provenance

PO approved and promoted this design to final on 2026-11-13 (D-51). The following records the pre-promotion checks; historical preservation counts refer to that review snapshot, not the now-replaced final. Gate findings remain open.

Date: 13 November 2026. Skills: design-taste-frontend + apple-design. Mode: internal software workspace.

50 post-login screens are available in index.html. Four role dashboards retain their own scope; login opens the unchanged approved final. The approved source suite, README images, XMind and implementation tasks are not replaced by this proposal.

Design: teal #087F78 from the PO reference, white/gray-green surfaces, pale sidebar, Inter UI typography. Materials distinguish the scrolling toolbar and protected modal. Semantic KPI/SLA colors and Night City are retained. No marketing claims, stock photography or external fonts were added. Voice: direct existing operational copy; all sample records remain DEMO.

Verification: 443/443 desktop checks; 493/493 mobile reduced-motion checks. Checks cover theme/fonts/viewport, static AI canvas, legacy surface contrast, modal opening/style, teal primary actions and actual Night City group/SLA queue filtering. Screenshots: 50 desktop + 8 mobile + 2 tablet, all saved with no browser warnings. Native Taste motion files are unmodified.

Additional verification: all 219 original final files match source-preservation.json; copied font binaries match the approved Vietnamese faces. Six AI SVGs parse and now embed only the active Inter face, reducing payload by 65.1% while preserving the active font bytes. Primary white/teal contrast 4.86:1; body/canvas 12.25:1; sidebar text 5.43:1; placeholder/white 4.81:1.

Taste gate scope: index.html is an iframe review controller. The checker evaluates it as a promotional software landing page, including hero height, promotional CTA/moment, fixed screen sections and a .wrap. It does not inspect the application document inside iframe#view. These findings remain OPEN; no waivers were added and no checker files were changed. The 50 application documents are checked independently by checks.html. This is a review proposal, not production acceptance or a complete accessibility audit.

Fixes made during the three gate rounds: loaded the native motion layer for the controller, enlarged review links, provided an explicit keyboard entry button for the preview browsing context and removed the ambiguous iframe tab stop.

## Open gate findings

- text-only | iframe#view | the closing section is only text: no picture, icon, mock or effect in it
- cta | iframe#view | the hero has no button (the nav's does not count)
- copy-fact | header > div > h1 "IT Operation Hub — Mac / Teal review" | the first screen holds no number, price, date, place, platform or genre
- empty-area | iframe#view | the section shows no content at all: 710px of ground
- moment-none | (the page) | a software page (--type) deals no moment: every kind carries one, two on a long page (moments.md)
- hero-screen | main#catalog-main > div.catalog-tools "Chọn màn để reviewHồ sơ cá nhânĐổi mật k" | the hero ends at 183px on a 900px screen, 717px above the fold: it ends at the fold, 1px either way (SR-1)
- hero-screen | iframe#view | 717px of the next section shows on the first screen (from 183px on a 900px screen): nothing below the hero shows at load (SR-1)
- section-height | iframe#view | the section is 710px tall (0.8 screens), 190px short of one screen (900px): every section after the hero is one screen or two, 2px either way (SR-2)
- section-height | main#catalog-main > div.catalog-tools "Chọn màn để reviewHồ sơ cá nhânĐổi mật k" | the section starts at 111px, 111px below the screen grid (0 x 900px): sections start on whole screens (SR-2)
- section-air | iframe#view | the section shows no content: its content fills 0% of its 710px (55% or more) (SR-3)
- one-section | main#catalog-main > div.catalog-tools "Chọn màn để reviewHồ sơ cá nhânĐổi mật k" | the screen at scroll 0px (stride 0) shows 72px of section 1 beside section 2: a screen shows one section (another may peek 8px, 24px WARN) (SR-4)
- one-section | iframe#view | a <iframe> sits directly in <main>: every part of <main> is a <section> (SR-4)
- container-edges | main#catalog-main > div.catalog-tools "Chọn màn để reviewHồ sơ cá nhânĐổi mật k" | the content of section 1 runs 24px from the left and 24px from the right (read from its outermost blocks: no .wrap): the margin is 64-120px at 1440px (one container, equal margins, 2px either way) (SR-6)
- container-edges | header "IT Operation Hub — Mac / Teal reviewKhôn" | the nav's content runs 32px from the left and 44px from the right (read from its outermost blocks: no .wrap): the page's container starts at 24px; 32 and 44px are not one margin; the margin is 64-120px at 1440px (one container, equal margins, 2px either way) (SR-6)
- container-edges | a.skip "Đến màn review" | a <a> at the top of the page, outside header.nav, main, footer.closing and nav.actionbar (SR-6)
- container | page | no .wrap

## Retained warnings

- skip-link | a.skip "Đến màn review" | the first Tab stop is "Đến màn review", not a skip link: a keyboard user tabs through the whole nav on every visit
- share-meta | head | the head lacks og:title, og:description, og:image, twitter:card, an icon, theme-color: a shared link shows no picture or title of its own

The valid skip link is retained for keyboard users. Share metadata is not supplied for a local internal review tool. No assumed real business claims, stand-in photographs, asset supply slots or invented brand were introduced.

## Review links

- /final/ ? all screens
- /final/dashboard.html?role=manager ? Manager
- /final/02-tickets.html#tickets ? Requests
- /final/05-ai.html#ai-normal ? AI reference
- /final/dialog-preview.html ? actual request-filter modal

AI references are static SVG designs; application responsiveness remains implementation-task work. Existing DEMO preview controls retain their documented limitations. No task lifecycle changed.
