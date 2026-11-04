"""Report generator for THE SILENCE INDEX.
Builds structured report as JSON, renders CSV exports, and compiles
high-fidelity museum-grade PDF reports via ReportLab.
"""
from typing import Dict, Any, List
import io
import csv
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether

# Palette colors from design tokens
OXBLOOD = colors.HexColor("#4A1C20")
HENNA = colors.HexColor("#6B2F27")
OLIVE = colors.HexColor("#3F4220")
GOLD = colors.HexColor("#C8A24A")
CREAM = colors.HexColor("#F6EEDB")
CREAM_CARD = colors.HexColor("#EDE0C4")
PARCHMENT = colors.HexColor("#D9C8A4")
INK = colors.HexColor("#2E1013")

def build_report_json(audit_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Structure full audit results into a cohesive report object."""
    return audit_dict

def export_report_csv(report_data: Dict[str, Any]) -> str:
    """Generate CSV string of findings and priorities."""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Metadata
    writer.writerow(["THE SILENCE INDEX - AUDIT REPORT"])
    writer.writerow(["Collection", report_data.get("collection", {}).get("name")])
    writer.writerow(["Audit ID", report_data.get("audit_id")])
    writer.writerow(["Cultural Coverage Debt (CCD)", report_data.get("ccd")])
    writer.writerow(["Assessability", report_data.get("assessability")])
    writer.writerow(["Generated At", datetime.now(timezone.utc).isoformat()])
    writer.writerow([])
    
    # Findings
    writer.writerow(["FINDINGS"])
    writer.writerow(["ID", "Kind", "Title", "Certainty", "Suggested Action", "Affected Records Count"])
    for f in report_data.get("findings", []):
        writer.writerow([
            f.get("id"),
            f.get("kind"),
            f.get("title"),
            f.get("certainty"),
            f.get("suggested_action"),
            len(f.get("record_ids", []))
        ])
    writer.writerow([])

    # Priorities
    writer.writerow(["PRESERVATION PRIORITIES"])
    writer.writerow(["ID", "Slice", "Dimension", "Score", "Band", "Consultation Protocol", "Next Step"])
    for p in report_data.get("priorities", []):
        writer.writerow([
            p.get("id"),
            p.get("slice", {}).get("name"),
            p.get("dimension_name"),
            p.get("score"),
            p.get("band"),
            p.get("consultation"),
            p.get("next_step")
        ])

    return output.getvalue()

def export_report_pdf(report_data: Dict[str, Any]) -> bytes:
    """Render a museum-grade audit report PDF with ReportLab."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=OXBLOOD,
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        "CoverSub",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=12,
        leading=16,
        textColor=HENNA,
        spaceAfter=14
    )
    h2_style = ParagraphStyle(
        "Heading2Custom",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=OXBLOOD,
        spaceBefore=14,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        "BodyCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13,
        textColor=INK
    )
    caveat_style = ParagraphStyle(
        "CaveatText",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=HENNA
    )

    story = []

    # Header / Title
    story.append(Paragraph("THE SILENCE INDEX", title_style))
    story.append(Paragraph("Cultural Collection Audit & Preservation Priority Report", subtitle_style))
    story.append(Paragraph("<i>Tagline: Because what is missing from history matters too.</i>", caveat_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=14))

    # Executive Summary Card
    col_name = report_data.get("collection", {}).get("name", "Analysed Collection")
    ccd_val = report_data.get("ccd", 0.0)
    ccd_ci = report_data.get("ccd_interval", [0.0, 0.0])
    assess = report_data.get("assessability", "N/A")
    tot_rec = report_data.get("total_records", 0)

    summary_text = (
        f"<b>Collection:</b> {col_name}<br/>"
        f"<b>Total Holdings Analysed:</b> {tot_rec} records<br/>"
        f"<b>Cultural Coverage Debt (CCD):</b> <b>{ccd_val:.1f}</b> (90% CI: {ccd_ci[0]} - {ccd_ci[1]})<br/>"
        f"<b>Assessability:</b> {assess}<br/>"
        f"<b>Audit Run Date:</b> {report_data.get('started_at', '2026')[:10]}"
    )
    summary_table = Table([[Paragraph(summary_text, body_style)]], colWidths=[530])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CREAM_CARD),
        ('BOX', (0,0), (-1,-1), 1, PARCHMENT),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 14))

    # Standing Caveat Notice
    caveat_box = Table([[
        Paragraph(
            "<b>MANDATORY CULTURAL INTEGRITY NOTICE:</b> Absence of a record in this analysis is never proof that a tradition, "
            "region, or community has less heritage. Cultural Coverage Debt measures documentation completeness in the holding, "
            "not cultural value. No tradition or community is ever ranked by importance.",
            caveat_style
        )
    ]], colWidths=[530])
    caveat_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FDF9F0")),
        ('BOX', (0,0), (-1,-1), 0.5, GOLD),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(caveat_box)
    story.append(Spacer(1, 14))

    # Key Findings Table
    story.append(Paragraph("Diagnostic Audit Findings", h2_style))
    findings = report_data.get("findings", [])
    if findings:
        f_data = [["Finding", "Certainty", "Suggested Action", "Affected Records"]]
        for f in findings[:6]:
            f_data.append([
                Paragraph(f"<b>{f.get('title')}</b><br/><font size=7.5 color='#555'>{f.get('issue')[:110]}...</font>", body_style),
                f.get("certainty", "").upper(),
                Paragraph(f.get("suggested_action", "")[:120], body_style),
                str(len(f.get("record_ids", [])))
            ])
        f_table = Table(f_data, colWidths=[180, 55, 230, 65])
        f_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), OXBLOOD),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 8.5),
            ('GRID', (0,0), (-1,-1), 0.5, PARCHMENT),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#FAF6EE")]),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(f_table)
    else:
        story.append(Paragraph("No critical diagnostic findings identified.", body_style))

    story.append(Spacer(1, 14))

    # Preservation Priorities Table
    story.append(Paragraph("Preservation Priority Roadmap & Consent Protocols", h2_style))
    priorities = report_data.get("priorities", [])
    if priorities:
        p_data = [["Slice / Dimension", "Score", "Band", "Consent Protocol", "Recommended Next Step"]]
        for p in priorities[:7]:
            p_data.append([
                Paragraph(f"<b>{p.get('slice', {}).get('name')}</b><br/>{p.get('dimension_name')}", body_style),
                f"{p.get('score', 0):.1f}",
                p.get("band", "").replace(" investigation priority", ""),
                Paragraph(f"<b>{p.get('consultation', '').upper()}</b>", body_style),
                Paragraph(p.get("next_step", "")[:130], body_style)
            ])
        p_table = Table(p_data, colWidths=[130, 45, 65, 80, 210])
        p_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), OLIVE),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 8.5),
            ('GRID', (0,0), (-1,-1), 0.5, PARCHMENT),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#FAF6EE")]),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(p_table)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

