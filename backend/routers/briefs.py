"""Documentation Brief Generator API Router (F5).
Generates printable, museum-grade one-page research briefs (PDF & JSON) for field researchers and liaisons.
"""
import io
from datetime import UTC, datetime
from fastapi import APIRouter, Depends, HTTPException, Response
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session

from backend.app.db import get_db
from backend.app.models import PreservationPriority, Audit, Collection

router = APIRouter(prefix="/api/priorities", tags=["Documentation Briefs"])

OXBLOOD = colors.HexColor("#4A1C20")
HENNA = colors.HexColor("#6B2F27")
OLIVE = colors.HexColor("#3F4220")
GOLD = colors.HexColor("#C8A24A")
CREAM = colors.HexColor("#F6EEDB")
CREAM_CARD = colors.HexColor("#EDE0C4")
PARCHMENT = colors.HexColor("#D9C8A4")
INK = colors.HexColor("#2E1013")

@router.get("/{priority_id}/brief")
def get_documentation_brief_data(priority_id: str, db: Session = Depends(get_db)):
    """Retrieve structured data for the Documentation Brief."""
    priority = db.query(PreservationPriority).filter(PreservationPriority.id == priority_id).first()
    if not priority:
        raise HTTPException(status_code=404, detail="Priority recommendation not found")

    slice_data = priority.slice_json or {}
    tradition_name = slice_data.get("name") or priority.dimension.replace("_", " ").title()

    questions = [
        f"What are the traditional indigenous names and vernacular terms for {tradition_name} in the local language?",
        "Who are the active master artisans, carriers, or elder custodians of this lineage today?",
        "What raw materials, botanical dyes, or mineral pigments are historically required, and how are they sourced?",
        "What ceremonial, ritual, or seasonal calendar dictates when and how this tradition is practiced?"
    ]

    care_checklist = [
        "Collective Benefit: Ensure community receives immediate copies of all recordings and documentation.",
        "Authority to Control: Confirm whether community elders permit photography, video, or sacred domain recording.",
        "Responsibility: Explain clearly how cataloguing will cite practitioner lineages and preserve moral rights.",
        "Ethics: Never record secret, esoteric, or ritual-restricted knowledge without explicit village elder consent."
    ]

    desk_research = [
        "Review State Directorate of Handicrafts and Handlooms gazetteers and regional survey reports.",
        "Check district archives, Census of India traditional craft monographs (1961/1971), and IGNCA publications.",
        "Contact the regional Zonal Cultural Centre (ZCC) and local artisan cooperative societies."
    ]

    return {
        "priority_id": priority.id,
        "tradition_name": tradition_name,
        "dimension": priority.dimension,
        "band": priority.band,
        "score": priority.score,
        "consultation": priority.consultation,
        "next_step": priority.next_step,
        "reasons": priority.reasons_json or [],
        "investigation_questions": questions,
        "care_checklist": care_checklist,
        "desk_research_steps": desk_research,
        "generated_at": datetime.now(UTC).isoformat()
    }

@router.get("/{priority_id}/brief.pdf")
def generate_documentation_brief_pdf(priority_id: str, db: Session = Depends(get_db)):
    """Generate high-fidelity, printable one-page PDF Documentation Brief."""
    data = get_documentation_brief_data(priority_id, db)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("BTitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=18, leading=22, textColor=OXBLOOD)
    sub_style = ParagraphStyle("BSub", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=HENNA)
    h2_style = ParagraphStyle("BH2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=OXBLOOD, spaceBefore=8, spaceAfter=4)
    body_style = ParagraphStyle("BBody", parent=styles["Normal"], fontName="Helvetica", fontSize=8.5, leading=11.5, textColor=INK)
    bullet_style = ParagraphStyle("BBullet", parent=styles["Normal"], fontName="Helvetica", fontSize=8, leading=11, textColor=INK, leftIndent=10)
    caveat_style = ParagraphStyle("BCaveat", parent=styles["Normal"], fontName="Helvetica-Oblique", fontSize=7.5, leading=10, textColor=HENNA)

    story = []
    # Header
    story.append(Paragraph("THE SILENCE INDEX — DOCUMENTATION BRIEF", title_style))
    story.append(Paragraph(f"Fieldwork Action Dossier: <b>{data['tradition_name']}</b>", sub_style))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=8))

    # Meta card
    meta_text = (
        f"<b>Target Tradition:</b> {data['tradition_name']} &nbsp;|&nbsp; "
        f"<b>Target Dimension:</b> {data['dimension'].replace('_', ' ').title()}<br/>"
        f"<b>Preservation Priority:</b> <b>{data['band']}</b> (Score: {data['score']:.1f}/100) &nbsp;|&nbsp; "
        f"<b>Consent Gate:</b> <font color='#843C32'><b>{data['consultation'].upper()}</b></font><br/>"
        f"<b>Immediate Action:</b> {data['next_step']}"
    )
    meta_table = Table([[Paragraph(meta_text, body_style)]], colWidths=[540])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CREAM_CARD),
        ('BOX', (0,0), (-1,-1), 1, PARCHMENT),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))

    # Questions to Investigate
    story.append(Paragraph("1. Primary Fieldwork Questions to Investigate", h2_style))
    for q in data["investigation_questions"]:
        story.append(Paragraph(f"• {q}", bullet_style))
    story.append(Spacer(1, 6))

    # CARE Principles Protocol Checklist
    story.append(Paragraph("2. CARE Principles & Indigenous Consent Checklist (MANDATORY)", h2_style))
    for c in data["care_checklist"]:
        story.append(Paragraph(f"☑ {c}", bullet_style))
    story.append(Spacer(1, 6))

    # Desk Research Steps
    story.append(Paragraph("3. Desk Research & Archival Preparation Before Field Approach", h2_style))
    for s in data["desk_research_steps"]:
        story.append(Paragraph(f"→ {s}", bullet_style))
    story.append(Spacer(1, 10))

    # Bottom notice
    notice_text = (
        "<b>ETHICAL PROTOCOL:</b> Absence of a record in an audited collection is never proof that a tradition or region has less heritage. "
        "The software never speaks for a community and never assigns Traditional Knowledge labels. Free, Prior, and Informed Consent (FPIC) "
        "must be obtained before recording practitioner oral histories."
    )
    notice_table = Table([[Paragraph(notice_text, caveat_style)]], colWidths=[540])
    notice_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FDF9F0")),
        ('BOX', (0,0), (-1,-1), 0.5, GOLD),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(notice_table)

    doc.build(story)
    pdf_data = buffer.getvalue()
    buffer.close()

    return Response(
        content=pdf_data,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Documentation_Brief_{data['priority_id']}.pdf"}
    )
