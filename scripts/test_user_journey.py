"""Automated end-to-end 15-step user journey verification script.
Walks through the entire user experience in Chromium headless via Playwright,
asserts critical UI states, verifies API data integration, and saves verification
screenshots into docs/screenshots/.
"""
import os
import time
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = "docs/screenshots"

def run_user_journey():
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    print("Initiating 15-Step End-to-End User Journey Verification...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 850})
        page = context.new_page()

        # Step 1: Open Landing Page
        print("Step 1: Open landing page...")
        page.goto("http://localhost:3000/")
        page.wait_for_selector("h1")
        page.screenshot(path=f"{SCREENSHOTS_DIR}/01_landing_page.png", full_page=True)
        print("✓ Step 1 complete. Saved 01_landing_page.png")

        # Step 2: Enter the Observatory
        print("Step 2: Enter Observatory...")
        page.goto("http://localhost:3000/observatory")
        page.wait_for_selector("table")
        page.screenshot(path=f"{SCREENSHOTS_DIR}/02_observatory.png", full_page=True)
        print("✓ Step 2 complete. Saved 02_observatory.png")

        # Step 3: Explore with Filters
        print("Step 3: Filter Observatory by state...")
        page.select_option("select:has-text('All States & UTs')", value="Bihar")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/03_observatory_filtered.png")
        print("✓ Step 3 complete. Saved 03_observatory_filtered.png")

        # Step 4: Open Auditor
        print("Step 4: Open Collection Auditor...")
        page.goto("http://localhost:3000/auditor")
        page.wait_for_selector("input[type='file']")
        page.screenshot(path=f"{SCREENSHOTS_DIR}/04_auditor_start.png")
        print("✓ Step 4 complete. Saved 04_auditor_start.png")

        # Step 5 & 6: Upload synthetic CSV & Confirm Mappings
        print("Step 5 & 6: Upload synthetic dataset...")
        synth_path = os.path.abspath("data/synthetic/synthetic_regional_museum.csv")
        page.set_input_files("input[type='file']", synth_path)
        page.click("button:has-text('Validate')")
        page.wait_for_selector("text=VALIDATION PASSED")
        page.screenshot(path=f"{SCREENSHOTS_DIR}/05_auditor_validated.png")
        print("✓ Step 5 complete. Saved 05_auditor_validated.png")

        page.click("button:has-text('Proceed to Column Mapping')")
        page.wait_for_selector("text=SCHEMA ALIGNMENT")
        page.screenshot(path=f"{SCREENSHOTS_DIR}/06_auditor_mapping.png")
        print("✓ Step 6 complete. Saved 06_auditor_mapping.png")

        # Step 7: Watch Progress
        print("Step 7: Execute audit...")
        page.click("button:has-text('Execute Collection Audit Now')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/07_auditor_progress.png")
        print("✓ Step 7 complete. Saved 07_auditor_progress.png")

        # Step 8: Read Audit Results Summary
        page.wait_for_selector("text=Audit Completed Successfully", timeout=20000)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/08_auditor_summary.png")
        print("✓ Step 8 complete. Saved 08_auditor_summary.png")

        # Step 9: Open Blind-Spot Map & Click a State
        print("Step 9: Open Blind-Spot Map...")
        page.goto("http://localhost:3000/map")
        page.wait_for_selector(".leaflet-state-polygon", timeout=15000)
        time.sleep(1)
        # Click an interactive state polygon to open the state drill-down panel
        page.locator(".leaflet-state-polygon").first.click(force=True)
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/09_blind_spot_map.png")
        print("✓ Step 9 complete. Saved 09_blind_spot_map.png")

        # Step 10: Open Coverage Matrix & Click a Cell
        print("Step 10: Open Coverage Matrix...")
        page.goto("http://localhost:3000/matrix")
        page.wait_for_selector("table")
        time.sleep(1)
        # Click first interactive cell
        page.locator("td.cursor-pointer").first.click()
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/10_coverage_matrix_cell.png")
        print("✓ Step 10 complete. Saved 10_coverage_matrix_cell.png")

        # Step 11: Open The Silence Report & Findings
        print("Step 11: Open The Silence Report...")
        page.goto("http://localhost:3000/reports/AUDIT-SAMPLE-REAL-001-INIT")
        page.wait_for_selector("h1:has-text('THE SILENCE REPORT')")
        page.screenshot(path=f"{SCREENSHOTS_DIR}/11_silence_report.png", full_page=True)
        print("✓ Step 11 complete. Saved 11_silence_report.png")

        # Step 12: Read Priorities & Consultation Flags
        print("Step 12: Open Preservation Priorities...")
        page.goto("http://localhost:3000/priorities")
        page.wait_for_selector("h1:has-text('Preservation Priority Engine')")
        # Click to reveal priority weight sliders and mathematical formula
        page.click("button:has-text('Adjust Priority Weights')")
        page.wait_for_selector("text=Formula:")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/12_preservation_priorities.png", full_page=True)
        print("✓ Step 12 complete. Saved 12_preservation_priorities.png")

        # Step 13: Browse Related Images & Open Viewer
        print("Step 13: Open Image Explorer...")
        page.goto("http://localhost:3000/explorer")
        page.wait_for_selector("img")
        time.sleep(1)
        # Click first image to open modal
        page.locator("img.cursor-pointer").first.click()
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/13_image_explorer_viewer.png")
        print("✓ Step 13 complete. Saved 13_image_explorer_viewer.png")

        # Step 14: Open Record Detail Page
        print("Step 14: Open Record Detail...")
        page.goto("http://localhost:3000/records/REC-REAL-0001")
        page.wait_for_selector("h1")
        page.screenshot(path=f"{SCREENSHOTS_DIR}/14_record_detail.png", full_page=True)
        print("✓ Step 14 complete. Saved 14_record_detail.png")

        # Step 15: Export PDF and CSV
        print("Step 15: Verify PDF & CSV export...")
        pdf_res = page.request.get("http://localhost:3000/api/audits/AUDIT-SAMPLE-REAL-001-INIT/report.pdf")
        assert pdf_res.status == 200, "PDF export must return 200"
        assert len(pdf_res.body()) > 1000, "PDF must have non-trivial size"
        print(f"✓ PDF export verified ({len(pdf_res.body())} bytes)")

        csv_res = page.request.get("http://localhost:3000/api/audits/AUDIT-SAMPLE-REAL-001-INIT/report.csv")
        assert csv_res.status == 200, "CSV export must return 200"
        assert b"THE SILENCE INDEX - AUDIT REPORT" in csv_res.body(), "CSV must contain header"
        print(f"✓ CSV export verified ({len(csv_res.body())} bytes)")

        browser.close()
        print("\nALL 15 STEPS OF THE USER JOURNEY VERIFIED AND SCREENSHOT EVIDENCE CAPTURED!")

if __name__ == "__main__":
    run_user_journey()
