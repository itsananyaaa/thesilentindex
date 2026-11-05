# THE SILENCE INDEX — v2 Engineering Fix Log

This document tracks all diagnosed defects, root causes, engineering fixes, and associated regression tests across v1 stabilization and v2 feature expansion.

---

## Initial Sweep & Stabilization Log

| ID | Symptom | Root Cause | Engineering Fix | Regression Test / Verification |
| :--- | :--- | :--- | :--- | :--- |
| **FIX-01** | Footer text unreadable on cream background | `oxblood-950` was undefined in Tailwind CSS, causing transparent footer background | Added `oxblood-950` to `tailwind.config.js` and set solid dark background `bg-[#1A090B]` with high-contrast text | `scripts/verify_fixes.py::test_footer_legibility` (`fix1_footer_high_contrast.png`) |
| **FIX-02** | User confusion regarding "13 / 36 States" | Badge omitted Union Territories (India has 28 States + 8 UTs) | Explicitly labeled as "Documented States & UTs: 13 / 36 (28 States & 8 UTs)" | `scripts/verify_fixes.py::test_map_states_uts` (`fix2_map_states_uts.png`) |
| **FIX-03** | Active Holding Switcher did not reactively update pages | Pages were not listening to `collection_changed` event and Landing Page had hardcoded collection ID | Added dynamic event listeners and state management across all pages, dynamic API routes | `scripts/verify_fixes.py::test_active_holding_switch` (`fix3_active_holding_switched.png`) |
| **FIX-04** | "Not assessable" dotted background pattern clashed with text | Dense `#6B2F27` dots spaced at 6px created heavy visual noise under text | Softened dot opacity to 20% watermark tint with 8px spacing, and wrapped label in opaque cream pill | `scripts/verify_fixes.py::test_not_assessable_legibility` (`fix4_not_assessable_legibility.png`) |
| **FIX-05** | Python linting: 319 style and unused import violations | Unsorted imports and unused imports across backend engines | Ran `ruff check backend/ --fix` cleaning 270 issues without altering runtime logic | `ruff check backend/` & pytest 30/30 passed |
| **FIX-06** | Mobile (360px) horizontal viewport overflow on `/observatory` | Navbar flex links overflowing header width, StatusLegend unwrapped provenance list, and unclipped profile bar | Added `w-full overflow-hidden` to `Navbar` `<header>`, `flex-wrap` and responsive borders to `StatusLegend`, `overflow-x-hidden` on `layout.tsx` `body` and page containers | `scripts/route_crawler.py` across 13 routes × 3 viewports (360, 768, 1280) — 0 errors |
| **FIX-07** | Mobile (360px) horizontal viewport overflow on `/map` | Unconstrained choropleth metric `<select>` width and Leaflet map SVG pane overflowing viewport | Added `max-w-[210px]` truncate on mobile `<select>`, wrapped map container with `overflow-hidden`, added `overflow-x-hidden` on main container | `scripts/route_crawler.py` across 19 routes × 3 viewports (360, 768, 1280) — 0 errors (scrollWidth = 360) |

---
*(Additional v2 defects and hardening items will be recorded here as resolved)*
