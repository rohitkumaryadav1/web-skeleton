# Final prototype review

Ready for the next development phase as a functional review build. Not ready for
production launch: contact delivery, live demos and remaining pages are outside scope.
The original homepage is unchanged, verified with SHA-256 hashes.

## Bugs and visual inconsistencies fixed

- Phone/tablet screens were behind their glass: corrected screen-plane depth.
- A fixed font weight was being used: replaced with genuine variable Manrope.
- Selection during scene mounting could race: apply the latest choice when ready.
- Failed texture loads could leave controls inconsistent: restore the committed choice.
- WebGL context loss could keep rendering: cancel frames and guard future draws.
- Failed initial textures could retain a renderer: dispose/remove it on failure.
- Static/reduced motion could blank after resize/repaint: retain the drawing buffer
  and redraw synchronously on resize. Two repaired captures were pixel-identical.
- Autoplay could appear active in reduced motion: disable it and clear timers.
- Tablet camera framing was too distant: derive camera distance from aspect ratio.
- Hero metadata touched its divider: measured clearance now exceeds 10px.
- Featured browser/caption overlap and clipping: corrected desktop framing. Measured
  browser right edge ~1041px; caption starts ~1093px.
- Corrected a stale scene index, added a local favicon and formatted authored source.

An apparent sticky-control failure came from the testing tool centring controls and
scrolling into the transition before clicking. Direct clicks and native keyboard
activation worked normally; this was not a user-facing selection bug.

## Browser checks

- All five industries on desktop and mobile committed the correct desktop, tablet
  and mobile texture identifiers. See industry-checks.json.
- Geometry/lighting remain consistent. Cursor movement produces bounded responses.
- Optional autoplay advances concepts. Pause and manual selection stop it.
- Keyboard activation and visible focus outlines work.
- Reduced-motion UI and forced reduced mode stop movement and autoplay; separate
  post-fix captures of the device view were identical.
- Module failure and actual forced WebGL-context loss leave usable static previews.
- Native scroll at y=400: progress .769, background rgb(196,195,189), scene scale
  1.169 and translation -232.5px. There is no intercepted scrolling.
- Mobile PageDown scrolls normally: relative hero, progress zero, copy opacity one.
- Filters show one card per industry; All restores five.
- Preview dialogs show correct images, close on Escape and restore trigger focus.
- Selected concept context reaches the enquiry notice; no information is submitted.
- Mobile menu opens and closes with Escape, restoring focus.
- 1440x900, 1366x768, 768x1024 and 390x844: no horizontal overflow; portfolio columns
  are 4/4/2/1. See layout-checks.json.
- No broken loaded images or normal-mode console warnings/errors observed.

## Static checks and performance safeguards

HTML parser: zero errors. CSS nested rules and declarations parse correctly,
including font-face declarations. Unique IDs, valid local paths and fragments,
and valid images. All fifteen screen dimensions match expectations. Imported
JavaScript modules executed successfully in the browser.

Enhancement is deferred; non-critical images are lazy-loaded. Mobile texture sizes
and pixel ratio are capped. Rendering pauses offscreen/background. Retaining the
drawing buffer uses extra GPU memory but keeps the static view stable. Full bundled
assets total about 3.6MB, including source photos not needed initially. No Lighthouse
or real-device frame-rate guarantee is claimed.

## Verification boundaries and unfinished work

Tests used Chromium responsive viewports, not physical touch hardware, Safari,
Firefox or a GPU matrix. System reduced-motion wiring/CSS were reviewed; the OS
setting itself was not changed. Actual in-page and forced reduced modes were tested.

No additional pages, real live demo sites, enquiry delivery or agency phone/WhatsApp
configuration. Screen designs remain concept artwork. These scope limits do not
prevent the next development phase.
