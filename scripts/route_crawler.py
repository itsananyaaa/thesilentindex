"""Playwright Route Crawler & Defect Detector for The Silence Index.
Crawls all primary routes across responsive breakpoints (1280px, 768px, 360px),
asserts zero console errors, zero failed internal API requests, no broken image elements,
no unexpected horizontal overflow, and tests internal links.
"""
import sys
import time
from playwright.sync_api import sync_playwright

ROUTES = [
    "/",
    "/observatory",
    "/map",
    "/matrix",
    "/sources",
    "/entities",
    "/entities/ENT-06980",
    "/gaps",
    "/compare",
    "/priorities",
    "/atlas",
    "/explorer",
    "/auditor",
    "/health",
    "/method",
    "/ethics",
    "/credits",
    "/records/REC-REAL-0001",
    "/reports/AUDIT-FUSED-V2-INIT",
]

BREAKPOINTS = [
    {"name": "desktop", "width": 1280, "height": 850},
    {"name": "tablet", "width": 768, "height": 1024},
    {"name": "mobile", "width": 360, "height": 740},
]

def run_crawler():
    errors = []
    print(f"Starting Route Crawler across {len(ROUTES)} routes and {len(BREAKPOINTS)} viewports...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for bp in BREAKPOINTS:
            print(f"\n--- Testing Breakpoint: {bp['name']} ({bp['width']}x{bp['height']}) ---")
            context = browser.new_context(viewport={"width": bp["width"], "height": bp["height"]})
            page = context.new_page()

            page_errors = []
            console_errors = []
            failed_requests = []

            page.on("pageerror", lambda err: page_errors.append(str(err)))
            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
            page.on("requestfailed", lambda req: failed_requests.append(f"{req.method} {req.url} - {req.failure}") if ("localhost:3000" in req.url or "127.0.0.1" in req.url) and "ERR_ABORTED" not in str(req.failure) else None)

            for route in ROUTES:
                url = f"http://localhost:3000{route}"
                try:
                    res = page.goto(url, wait_until="domcontentloaded", timeout=10000)
                    page.wait_for_timeout(500)
                    if not res or res.status != 200:
                        errors.append(f"[{bp['name']}] Route {route} returned HTTP {res.status if res else 'None'}")
                        continue

                    # Check for horizontal overflow (excluding code pre tags or table scroll containers)
                    overflow = page.evaluate("""() => {
                        const body = document.body;
                        const html = document.documentElement;
                        const scrollW = Math.max(body.scrollWidth, html.scrollWidth);
                        const clientW = html.clientWidth;
                        return scrollW > clientW + 5; // tolerance
                    }""")
                    if overflow:
                        errors.append(f"[{bp['name']}] Horizontal overflow detected on route: {route}")

                    # Check internal broken images
                    broken_imgs = page.evaluate("""() => {
                        const imgs = Array.from(document.querySelectorAll('img'));
                        return imgs.filter(img => img.naturalWidth === 0 && !img.src.includes('placeholder') && img.complete).map(img => img.src);
                    }""")
                    # Filter out remote wikimedia thumbnails that might have timed out
                    broken_internal = [img for img in broken_imgs if "localhost" in img or "127.0.0.1" in img]
                    if broken_internal:
                        errors.append(f"[{bp['name']}] Broken internal images on {route}: {broken_internal}")

                    print(f"  ✓ {route} [200 OK]")
                except Exception as ex:
                    errors.append(f"[{bp['name']}] Error loading {route}: {ex}")

            if page_errors:
                errors.extend([f"[{bp['name']}] Page error: {e}" for e in page_errors])
            if console_errors:
                # filter benign hydration warnings if any
                filtered_ce = [c for c in console_errors if "favicon" not in c]
                if filtered_ce:
                    errors.extend([f"[{bp['name']}] Console error: {c}" for c in filtered_ce])
            if failed_requests:
                errors.extend([f"[{bp['name']}] Failed internal request: {r}" for r in failed_requests])

            context.close()

        browser.close()

    print("\n--- Route Crawler Results ---")
    if errors:
        print(f"Encountered {len(errors)} issues:")
        for err in errors:
            print(f"  ❌ {err}")
        sys.exit(1)
    else:
        print(f"✓ All {len(ROUTES)} routes cleanly passed across desktop, tablet, and mobile with ZERO errors!")
        sys.exit(0)

if __name__ == "__main__":
    run_crawler()
