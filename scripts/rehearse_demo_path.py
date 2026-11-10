import time
import json
import os
from playwright.sync_api import sync_playwright

def run_rehearsal():
    base_url = "https://thesilentindex.vercel.app"
    results = {
        "steps": [],
        "console_errors": [],
        "failed_requests": [],
        "timings": {}
    }
    
    os.makedirs("docs/screenshots/rehearsal", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # Listen to console
        def handle_console(msg):
            if msg.type in ["error"]:
                results["console_errors"].append(f"[{msg.type.upper()}] {msg.text}")
        page.on("console", handle_console)

        # Listen to network failures
        def handle_response(response):
            if response.status >= 400:
                results["failed_requests"].append(f"[{response.status}] {response.url}")
        page.on("response", handle_response)

        # Step 1: Landing
        t0 = time.time()
        print("Navigating to landing page...")
        page.goto(base_url, wait_until="networkidle", timeout=60000)
        time.sleep(2)
        page.screenshot(path="docs/screenshots/rehearsal/01_landing_initial.png")
        t_landing = time.time() - t0
        results["timings"]["landing"] = round(t_landing, 2)
        print("Landing page loaded in", t_landing, "s")

        # Step 2: 90-second tour (auto-opens or manual)
        t0 = time.time()
        print("Checking for tour modal...")
        time.sleep(2) # wait for auto-open timer
        tour_modal = page.locator("div.fixed.inset-0").first
        if tour_modal.count() > 0 and tour_modal.is_visible():
            print("Tour modal detected!")
            page.screenshot(path="docs/screenshots/rehearsal/02_tour_opened.png")
            # Close tour
            close_btn = page.locator("button[aria-label='Close Tour'], button:has-text('Skip Tour'), button:has-text('Done')").first
            if close_btn.count() > 0:
                close_btn.click()
                time.sleep(1)
        results["timings"]["tour"] = round(time.time() - t0, 2)

        # Step 3: /map in fused-v2 (default)
        t0 = time.time()
        print("Navigating to /map (fused-v2)...")
        page.goto(f"{base_url}/map", wait_until="networkidle", timeout=60000)
        time.sleep(3)
        page.screenshot(path="docs/screenshots/rehearsal/03_map_fused.png")

        # Click Ladakh chip on fused map
        la_chip = page.locator("button:has-text('(LA)'), button:has-text('Ladakh')").first
        if la_chip.count() > 0:
            la_chip.click()
            time.sleep(2)
            page.screenshot(path="docs/screenshots/rehearsal/04_map_fused_ladakh.png")
            print("Clicked Ladakh on fused map.")

        # Switch to museum-only collection via localStorage
        print("Switching active collection to sample-real-001 via localStorage...")
        page.evaluate("localStorage.setItem('silence_index_active_collection', 'sample-real-001')")
        page.reload(wait_until="networkidle")
        time.sleep(3)
        la_chip = page.locator("button:has-text('(LA)'), button:has-text('Ladakh')").first
        if la_chip.count() > 0:
            la_chip.click()
            time.sleep(2)
            page.screenshot(path="docs/screenshots/rehearsal/03_map_museum_ladakh.png")
            print("Clicked Ladakh on museum-only map.")

        # Switch back to fused-v2
        page.evaluate("localStorage.setItem('silence_index_active_collection', 'fused-v2')")
        results["timings"]["map"] = round(time.time() - t0, 2)

        # Step 4: /entities/ENT-70533
        t0 = time.time()
        print("Navigating to /entities/ENT-70533...")
        page.goto(f"{base_url}/entities/ENT-70533", wait_until="networkidle", timeout=60000)
        time.sleep(3)
        page.screenshot(path="docs/screenshots/rehearsal/05_entity_pashmina.png")
        results["timings"]["entity_pashmina"] = round(time.time() - t0, 2)

        # Step 5: /gaps
        t0 = time.time()
        print("Navigating to /gaps...")
        page.goto(f"{base_url}/gaps", wait_until="networkidle", timeout=60000)
        time.sleep(3)
        page.screenshot(path="docs/screenshots/rehearsal/06_gaps.png")
        results["timings"]["gaps"] = round(time.time() - t0, 2)

        # Step 6: /priorities
        t0 = time.time()
        print("Navigating to /priorities...")
        page.goto(f"{base_url}/priorities", wait_until="networkidle", timeout=60000)
        time.sleep(3)
        
        # Click Generate Brief
        brief_btn = page.locator("button:has-text('Generate Brief'), button:has-text('Brief')").first
        if brief_btn.count() > 0:
            brief_btn.click()
            time.sleep(3)
            page.screenshot(path="docs/screenshots/rehearsal/07_priorities_brief.png")
            print("Brief modal opened successfully.")
        results["timings"]["priorities"] = round(time.time() - t0, 2)

        # Step 7: /health
        t0 = time.time()
        print("Navigating to /health...")
        page.goto(f"{base_url}/health", wait_until="networkidle", timeout=60000)
        time.sleep(3)
        page.screenshot(path="docs/screenshots/rehearsal/08_health.png")
        results["timings"]["health"] = round(time.time() - t0, 2)

        browser.close()

    with open("docs/screenshots/rehearsal/rehearsal_report.json", "w") as f:
        json.dump(results, f, indent=2)
    print("Rehearsal finished successfully!")
    print("Timings:", results["timings"])
    print(f"Console errors: {len(results['console_errors'])}")
    print(f"Failed requests: {len(results['failed_requests'])}")

if __name__ == "__main__":
    run_rehearsal()
