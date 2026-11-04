from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 850})
    page.goto("http://localhost:3000/map")
    page.wait_for_selector(".leaflet-state-polygon", timeout=15000)
    print("Found state polygon!")
    # Click the polygon to select state
    page.locator(".leaflet-state-polygon").first.click()
    page.wait_for_timeout(1000)
    page.screenshot(path="docs/screenshots/09_blind_spot_map.png")
    print("Saved docs/screenshots/09_blind_spot_map.png successfully!")
    browser.close()
