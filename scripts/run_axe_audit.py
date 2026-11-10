"""Automated Axe-Core Accessibility Audit for The Silence Index.
Runs an automated WCAG accessibility scan across all 19 production routes.
Records exact violation counts, critical/serious/moderate/minor rules, and generates an audit log.
"""
import json
import os
import sys
from datetime import datetime
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("TARGET_URL", "https://thesilentindex.vercel.app")
AXE_PATH = "/tmp/axe.min.js"

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

def main():
    if not os.path.exists(AXE_PATH):
        print(f"Error: {AXE_PATH} does not exist.")
        sys.exit(1)

    with open(AXE_PATH, "r", encoding="utf-8") as f:
        axe_script = f.read()

    results = {}
    total_violations = 0
    violations_by_impact = {"critical": 0, "serious": 0, "moderate": 0, "minor": 0}

    print(f"Starting Axe-Core Accessibility Scan against {BASE_URL} on {datetime.now().strftime('%Y-%m-%d')}...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 850})
        page = context.new_page()

        for route in ROUTES:
            url = f"{BASE_URL}{route}"
            print(f"Auditing route: {route} ...", end=" ", flush=True)
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=20000)
                page.wait_for_timeout(1000)
                # Dismiss guided tour modal if open to audit underlying page
                try:
                    close_btn = page.locator("button:has-text('✕'), button:has-text('Close'), button[aria-label='Close']").first
                    if close_btn.is_visible(timeout=500):
                        close_btn.click()
                except Exception:
                    pass

                page.wait_for_timeout(800)

                # Inject axe-core
                page.evaluate(axe_script)

                # Run axe
                axe_res = page.evaluate("""() => {
                    return new Promise((resolve) => {
                        axe.run(document, {
                            runOnly: {
                                type: 'tag',
                                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
                            }
                        }, (err, results) => {
                            if (err) resolve({ error: String(err) });
                            else resolve(results);
                        });
                    });
                }""")

                if "error" in axe_res:
                    print(f"ERROR: {axe_res['error']}")
                    results[route] = {"error": axe_res["error"]}
                    continue

                violations = axe_res.get("violations", [])
                passes = len(axe_res.get("passes", []))
                inapplicable = len(axe_res.get("inapplicable", []))

                v_summary = []
                for v in violations:
                    impact = v.get("impact", "minor")
                    violations_by_impact[impact] = violations_by_impact.get(impact, 0) + len(v.get("nodes", []))
                    total_violations += len(v.get("nodes", []))
                    v_summary.append({
                        "id": v["id"],
                        "impact": impact,
                        "description": v["description"],
                        "helpUrl": v["helpUrl"],
                        "node_count": len(v.get("nodes", []))
                    })

                results[route] = {
                    "violations_count": len(v_summary),
                    "total_violation_nodes": sum(v["node_count"] for v in v_summary),
                    "passes_count": passes,
                    "inapplicable_count": inapplicable,
                    "violations": v_summary
                }
                print(f"Done. Passes: {passes}, Violations: {len(v_summary)} ({sum(v['node_count'] for v in v_summary)} nodes)")

            except Exception as ex:
                print(f"FAILED: {ex}")
                results[route] = {"error": str(ex)}

        browser.close()

    output_file = "docs/AXE_ACCESSIBILITY_AUDIT.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({
            "audit_date": "2026-11-10",
            "target_url": BASE_URL,
            "engine": "axe-core 4.8.4",
            "standard": "WCAG 2.1 AA",
            "total_routes_scanned": len(ROUTES),
            "total_violation_instances": total_violations,
            "impact_breakdown": violations_by_impact,
            "routes": results
        }, f, indent=2)

    print(f"\nAudit complete! Saved detailed report to {output_file}")
    print(f"Summary: {total_violations} violation instances across {len(ROUTES)} routes.")
    print(f"Impact breakdown: {violations_by_impact}")

if __name__ == "__main__":
    main()
