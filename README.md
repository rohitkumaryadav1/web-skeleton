# Web Skeleton — Display Room prototype

The original `G:/webskeleton` homepage is unchanged. This is a separate review build.

## Run on Windows

Run in PowerShell:

```powershell
python -m http.server 8770 --bind 127.0.0.1 --directory "G:\webskeleton-prototype"
```

Open http://127.0.0.1:8770/ . Stop with Ctrl+C. After extracting the ZIP elsewhere,
replace the directory with the extracted path. VS Code Live Server also works.
Use HTTP rather than double-clicking index.html: this prototype uses ES modules.
Python is only a local preview option; hosting needs no Python, Node.js, npm,
backend or build process.

## Important files

- `index.html`: navigation, hero, featured work, portfolio and enquiry notice.
- `assets/css/style.css`: responsive editorial design and motion fallbacks.
- `assets/js/app.js`: selection, autoplay, scrolling, menu, filters and dialogs.
- `assets/js/scene.js`: actual Three.js device geometry, lighting and lifecycle.
- `assets/js/data.js`: the five project records.
- `assets/vendor/`: pinned Three.js 0.180.0 and its MIT license.
- `assets/images/screens/`: fifteen desktop/tablet/mobile WebP layouts.
- `assets/images/`: source photography and favicon.
- `assets/fonts/`: Manrope variable font and OFL license.
- `review/`: screenshots and verification evidence. Intermediate captures in the
  working folder are excluded from the distribution ZIP.
- `tools/make_screens.py`: optional Windows/Pillow artwork regeneration source.

## Controls and fallbacks

Manual industry selection updates all three devices and stops optional autoplay.
Play/Pause controls project rotation. Reduce motion disables floating, pointer
response, autoplay and scroll choreography. Keyboard: Tab, Enter/Space and Escape.
Dialogs return focus to their trigger. Mobile uses normal document flow.

Diagnostic URLs:

- `/?motion=reduce`: start with reduced motion.
- `/?scene=off`: skip 3D.
- `/?scene=fail`: exercise the enhancement-failure catch path.
- `/?scene=lost`: force this page's actual WebGL context to be lost.

Reload the normal URL to restore 3D. Static selection and portfolio controls remain
usable after failure. The system prefers-reduced-motion preference is also wired
into the reduced-motion state and CSS.

## Hosting and limitations

Upload `index.html` and `assets/` to a separate preview directory such as
`public_html/prototype/`, preserving case and hierarchy. Leave the existing site
intact. Static Vercel hosting also needs no build command. No deployment was made.
Keep tools, review evidence and documentation out of the public document root.
Normal JavaScript MIME types and gzip/Brotli compression are recommended.

All runtime assets are local. No GSAP, external fonts, CDN calls, audio or video.
Screen layouts are concept artwork, not live demo websites. Geometry is procedural,
not manufacturer CAD; fallback devices are simpler. Enquiries are not connected,
and no data is collected, stored or sent. No About, Services or Contact pages added.
Tests used Chromium responsive viewports, not physical phones or every browser/GPU.
See `review/QA.md` for results and verification boundaries.
