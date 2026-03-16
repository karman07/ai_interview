import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Resume } from '@/types/Resume';
import type { InterviewV2Report } from '@/api/interviewV2';

// ─────────────────────────────────────────────────────────────────────────────
// Interview Report PDF Generator
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_W  = 210;
const PAGE_H  = 297;
const MARGIN  = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Brand colours (RGB)
const C = {
    purple  : [108, 99, 255] as [number, number, number],
    teal    : [0, 212, 170]  as [number, number, number],
    amber   : [255, 184, 0]  as [number, number, number],
    red     : [255, 77, 77]  as [number, number, number],
    dark    : [15, 23, 42]   as [number, number, number],
    slate   : [30, 41, 59]   as [number, number, number],
    mid     : [71, 85, 105]  as [number, number, number],
    light   : [148, 163, 184] as [number, number, number],
    white   : [255, 255, 255] as [number, number, number],
    success : [34, 197, 94]  as [number, number, number],
};

function scoreColour(s: number): [number, number, number] {
    if (s >= 75) return C.teal;
    if (s >= 50) return C.amber;
    return C.red;
}

function clamp(text: string, max: number) {
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

function safeStr(v: unknown): string {
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object' && 'name' in v) return String((v as any).name);
    return String(v ?? '');
}

/** Add a coloured filled rectangle (handy helper) */
function fillRect(doc: jsPDF, x: number, y: number, w: number, h: number, rgb: [number,number,number]) {
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(x, y, w, h, 'F');
}

/** Draw the standard footer on the current page */
function drawFooter(doc: jsPDF, pageNum: number, totalPages: number, role: string) {
    const y = PAGE_H - 8;
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y - 3, PAGE_W - MARGIN, y - 3);
    doc.setFontSize(7.5);
    doc.setTextColor(...C.mid);
    doc.setFont('helvetica', 'normal');
    doc.text('AI for Job™ · Interview Report', MARGIN, y);
    doc.text(`Role: ${role}`, PAGE_W / 2, y, { align: 'center' });
    doc.text(`Page ${pageNum} / ${totalPages}`, PAGE_W - MARGIN, y, { align: 'right' });
}

/** Draw coloured score badge (circle + number) */
function drawScoreBadge(doc: jsPDF, cx: number, cy: number, score: number, radius = 12) {
    const rgb = scoreColour(score);
    doc.setFillColor(rgb[0], rgb[1], rgb[2], 0.15);
    // Outer ring
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.setLineWidth(1.5);
    doc.circle(cx, cy, radius, 'S');
    // Score text
    doc.setFontSize(radius > 10 ? 14 : 10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    doc.text(`${score}`, cx, cy + 1.5, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('/100', cx, cy + 6.5, { align: 'center' });
}

/** Draw a mini horizontal bar  */
function drawBar(doc: jsPDF, x: number, y: number, w: number, pct: number, rgb: [number,number,number]) {
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(x, y, w, 3, 1.5, 1.5, 'F');
    if (pct > 0) {
        doc.setFillColor(rgb[0], rgb[1], rgb[2]);
        doc.roundedRect(x, y, w * Math.min(pct / 100, 1), 3, 1.5, 1.5, 'F');
    }
}

/** Write a section heading */
function sectionHeading(doc: jsPDF, y: number, title: string): number {
    doc.setFillColor(108, 99, 255, 0.08);
    fillRect(doc, MARGIN, y, CONTENT_W, 7, [20, 30, 50]);
    doc.setDrawColor(...C.purple);
    doc.setLineWidth(0.8);
    doc.line(MARGIN, y, MARGIN + 3, y + 7);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.purple);
    doc.text(title.toUpperCase(), MARGIN + 6, y + 5);
    return y + 10;
}

/** Ensure there is at least `needed` mm left; add page if not */
function ensureSpace(doc: jsPDF, y: number, needed: number): number {
    if (y + needed > PAGE_H - 16) {
        doc.addPage();
        return 18;
    }
    return y;
}

/** Bullet list helper — returns new y */
function bulletList(
    doc: jsPDF,
    items: string[],
    x: number,
    y: number,
    maxW: number,
    rgb: [number,number,number] = C.light,
    bulletRgb: [number,number,number] = C.purple,
): number {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    for (const raw of items) {
        const item = safeStr(raw);
        y = ensureSpace(doc, y, 8);
        doc.setFillColor(bulletRgb[0], bulletRgb[1], bulletRgb[2]);
        doc.circle(x + 1.2, y - 1, 1, 'F');
        doc.setTextColor(rgb[0], rgb[1], rgb[2]);
        const lines = doc.splitTextToSize(item, maxW - 5);
        doc.text(lines, x + 4, y);
        y += lines.length * 4.5;
    }
    return y;
}

export function generateInterviewReport(report: InterviewV2Report, role?: string, roundType?: string): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    const overallScore = Math.round((report.summary?.overall_score ?? 0) * (report.summary?.overall_score > 1 ? 1 : 10));
    const scoreNorm    = overallScore <= 10 ? overallScore * 10 : overallScore;   // ensure 0-100
    const roleName     = role ?? 'Interview Report';
    const dateStr      = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const hireRec      = report.summary?.hire_recommendation ?? '';

    // ── PAGE 1: Header + Summary ──────────────────────────────────────────────

    // Dark header block
    fillRect(doc, 0, 0, PAGE_W, 46, C.dark);
    // Accent bar left edge
    fillRect(doc, 0, 0, 3, 46, C.purple);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...C.white);
    doc.text('Interview Performance Report', MARGIN + 4, 16);

    // Role pill
    doc.setFontSize(9);
    doc.setTextColor(...C.light);
    doc.text(`${roundType ? roundType.toUpperCase() + ' ROUND  ·  ' : ''}${roleName}`, MARGIN + 4, 24);

    doc.setFontSize(8);
    doc.setTextColor(...C.mid);
    doc.text(`Generated  ${dateStr}`, MARGIN + 4, 31);

    // Score badge in header
    drawScoreBadge(doc, PAGE_W - MARGIN - 14, 21, scoreNorm, 12);

    // Hire recommendation chip
    const hireColour = hireRec.toLowerCase().includes('strong') || hireRec.toLowerCase().includes('hire')
        ? C.teal : hireRec.toLowerCase().includes('consider') ? C.amber : C.red;
    fillRect(doc, PAGE_W - MARGIN - 52, 36, 38, 7, hireColour);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.dark);
    doc.text(clamp(hireRec, 22), PAGE_W - MARGIN - 33, 40.5, { align: 'center' });

    let y = 54;

    // ── Summary cards row ─────────────────────────────────────────────────────
    const cardW = (CONTENT_W - 6) / 3;
    const cards: Array<{ label: string; value: string; rgb: [number,number,number] }> = [
        { label: 'Seniority',  value: report.summary?.seniority_assessment  ?? '—', rgb: C.purple },
        { label: 'Confidence', value: report.summary?.confidence_assessment ?? '—', rgb: C.teal   },
        { label: 'Round',      value: roundType ?? 'N/A',                           rgb: C.amber   },
    ];
    cards.forEach((card, i) => {
        const cx = MARGIN + i * (cardW + 3);
        fillRect(doc, cx, y, cardW, 14, C.slate);
        doc.setDrawColor(card.rgb[0], card.rgb[1], card.rgb[2]);
        doc.setLineWidth(0.5);
        doc.rect(cx, y, cardW, 14);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.mid);
        doc.text(card.label.toUpperCase(), cx + 4, y + 5);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.white);
        doc.text(clamp(card.value, 22), cx + 4, y + 11);
    });
    y += 20;

    // ── Dimension Scores ──────────────────────────────────────────────────────
    y = sectionHeading(doc, y, 'Dimension Scores');
    const dims: Array<[string, number]> = [
        ['Technical Depth',   report.dimension_scores?.technical_depth  ?? 0],
        ['Problem Solving',   report.dimension_scores?.problem_solving   ?? 0],
        ['System Design',     report.dimension_scores?.system_design     ?? 0],
        ['Communication',     report.dimension_scores?.communication     ?? 0],
        ['Role Fit',          report.dimension_scores?.role_fit          ?? 0],
    ];
    const colW = (CONTENT_W - 4) / 2;
    dims.forEach(([label, rawScore], i) => {
        const score = rawScore <= 10 ? rawScore * 10 : rawScore;
        const rgb = scoreColour(score);
        const col = i % 2;
        const row = Math.floor(i / 2);
        const dx = MARGIN + col * (colW + 4);
        const dy = y + row * 14;
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.dark);
        doc.text(label, dx, dy + 1);
        drawBar(doc, dx, dy + 3, colW - 24, score, rgb);
        doc.setFontSize(9);
        doc.setTextColor(rgb[0], rgb[1], rgb[2]);
        doc.text(`${score}`, dx + colW - 20, dy + 6, { align: 'right' });
    });
    y += Math.ceil(dims.length / 2) * 14 + 6;

    // ── Key Strengths & Areas to Improve ─────────────────────────────────────
    y = ensureSpace(doc, y, 30);
    y = sectionHeading(doc, y, 'Strengths & Areas to Improve');

    const halfW = (CONTENT_W - 6) / 2;
    const strengths = report.summary?.key_strengths ?? [];
    const improvements = report.summary?.key_areas_for_improvement ?? [];

    // Left column: strengths
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.teal);
    doc.text('Key Strengths', MARGIN, y + 1);
    let leftY = y + 5;
    leftY = bulletList(doc, strengths.slice(0, 5), MARGIN, leftY, halfW, C.light, C.teal);

    // Right column: improvements
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.red);
    doc.text('Areas to Improve', MARGIN + halfW + 6, y + 1);
    let rightY = y + 5;
    rightY = bulletList(doc, improvements.slice(0, 5), MARGIN + halfW + 6, rightY, halfW, C.light, C.red);

    y = Math.max(leftY, rightY) + 6;

    // ── PAGE BREAK before Q&A ─────────────────────────────────────────────────
    // ── Question-Wise Analysis ────────────────────────────────────────────────
    const questions = report.question_wise_analysis ?? [];
    if (questions.length > 0) {
        y = ensureSpace(doc, y, 20);
        y = sectionHeading(doc, y, 'Question-by-Question Analysis');

        for (let qi = 0; qi < questions.length; qi++) {
            const q = questions[qi];
            const qScore = Math.round(q.score <= 10 ? q.score * 10 : q.score);
            const qRgb = scoreColour(qScore);

            y = ensureSpace(doc, y, 28);

            // Question number pill
            doc.setFillColor(108, 99, 255, 0.15);
            fillRect(doc, MARGIN, y, CONTENT_W, 8, C.slate);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...C.purple);
            doc.text(`Q${qi + 1}`, MARGIN + 2, y + 5.5);

            // Question text
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...C.white);
            const qLines = doc.splitTextToSize(safeStr(q.question), CONTENT_W - 22);
            doc.text(qLines, MARGIN + 8, y + 5.5);

            // Score pill right-aligned
            doc.setFillColor(qRgb[0], qRgb[1], qRgb[2]);
            fillRect(doc, PAGE_W - MARGIN - 14, y + 1, 10, 6, qRgb);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...C.dark);
            doc.text(`${qScore}`, PAGE_W - MARGIN - 9, y + 5.5, { align: 'center' });

            y += qLines.length * 4.5 + 5;

            // Answer summary
            if (q.user_answer_summary) {
                y = ensureSpace(doc, y, 8);
                doc.setFontSize(7.5);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...C.amber);
                doc.text('Answer Summary:', MARGIN + 2, y);
                y += 4;
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...C.light);
                const aLines = doc.splitTextToSize('  ' + safeStr(q.user_answer_summary), CONTENT_W - 6);
                doc.text(aLines, MARGIN + 2, y);
                y += aLines.length * 4 + 2;
            }

            // Strengths / weaknesses (compact)
            const eStr = (q.evaluation?.strengths ?? []).slice(0, 2).map(safeStr);
            const eWeak = (q.evaluation?.weaknesses ?? []).slice(0, 2).map(safeStr);
            if (eStr.length || eWeak.length) {
                y = ensureSpace(doc, y, 10);
                doc.setFontSize(7);
                if (eStr.length) {
                    doc.setTextColor(...C.teal);
                    doc.setFont('helvetica', 'bold');
                    doc.text('✓ ' + eStr.join('  ·  '), MARGIN + 2, y);
                    y += 4.5;
                }
                if (eWeak.length) {
                    doc.setTextColor(...C.red);
                    doc.setFont('helvetica', 'bold');
                    doc.text('✗ ' + eWeak.join('  ·  '), MARGIN + 2, y);
                    y += 4.5;
                }
            }
            y += 4;
        }
    }

    // ── Skill Gap Analysis ────────────────────────────────────────────────────
    const gaps = report.skill_gap_analysis;
    if (gaps) {
        y = ensureSpace(doc, y, 20);
        y = sectionHeading(doc, y, 'Skill Gap Analysis');
        const gapCols: Array<[string, string[], [number,number,number]]> = [
            ['Critical',  gaps.critical_gaps  ?? [], C.red   ],
            ['Moderate',  gaps.moderate_gaps  ?? [], C.amber ],
            ['Minor',     gaps.minor_gaps     ?? [], C.teal  ],
        ];
        const gapW = (CONTENT_W - 8) / 3;
        let maxGapY = y;
        gapCols.forEach(([label, items, rgb], gi) => {
            const gx = MARGIN + gi * (gapW + 4);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(rgb[0], rgb[1], rgb[2]);
            doc.text(label, gx, y + 1);
            let gy = y + 6;
            gy = bulletList(doc, items, gx, gy, gapW + 2, C.light, rgb);
            maxGapY = Math.max(maxGapY, gy);
        });
        y = maxGapY + 6;
    }

    // ── Behavioral Insights ───────────────────────────────────────────────────
    const bi = report.behavioral_insights;
    if (bi) {
        y = ensureSpace(doc, y, 24);
        y = sectionHeading(doc, y, 'Behavioral Insights');
        const biItems: Array<[string, string]> = [
            ['Communication Style', bi.communication_style ?? '—'],
            ['Thinking Pattern',    bi.thinking_pattern    ?? '—'],
            ['Pressure Handling',   bi.pressure_handling   ?? '—'],
        ];
        biItems.forEach(([label, value]) => {
            y = ensureSpace(doc, y, 10);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...C.purple);
            doc.text(`${label}: `, MARGIN, y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...C.white);
            const vLines = doc.splitTextToSize(safeStr(value), CONTENT_W - 40);
            doc.text(vLines, MARGIN + 38, y);
            y += Math.max(vLines.length * 4, 5) + 2;
        });
        y += 4;
    }

    // ── Improvement Plan ─────────────────────────────────────────────────────
    const plan = report.improvement_plan;
    if (plan) {
        y = ensureSpace(doc, y, 20);
        y = sectionHeading(doc, y, 'Improvement Plan');
        const planCols: Array<[string, string[], [number,number,number]]> = [
            ['Immediate',  plan.immediate_actions ?? [], C.red   ],
            ['1 Week',     plan.plan_1_week       ?? [], C.amber ],
            ['1 Month',    plan.plan_1_month      ?? [], C.teal  ],
        ];
        const pColW = (CONTENT_W - 8) / 3;
        let maxPlanY = y;
        planCols.forEach(([label, items, rgb], pi) => {
            const px = MARGIN + pi * (pColW + 4);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(rgb[0], rgb[1], rgb[2]);
            doc.text(label, px, y + 1);
            let py = y + 6;
            py = bulletList(doc, items, px, py, pColW + 2, C.light, rgb);
            maxPlanY = Math.max(maxPlanY, py);
        });
        y = maxPlanY + 6;
    }

    // ── Final Verdict ─────────────────────────────────────────────────────────
    const verdict = report.verdict;
    if (verdict) {
        y = ensureSpace(doc, y, 30);
        y = sectionHeading(doc, y, 'Final Verdict');

        if (verdict.final_recommendation_text) {
            fillRect(doc, MARGIN, y, CONTENT_W, 1, C.purple);
            y += 4;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bolditalic');
            doc.setTextColor(...C.white);
            const recLines = doc.splitTextToSize(`"${safeStr(verdict.final_recommendation_text)}"`, CONTENT_W - 4);
            doc.text(recLines, MARGIN + 2, y);
            y += recLines.length * 5 + 6;
        }

        const verdictCols: Array<[string, string[], [number,number,number]]> = [
            ['Highlight These',         verdict.strengths_to_highlight            ?? [], C.teal ],
            ['Fix Before Next Round',   verdict.areas_to_fix_before_next_interview ?? [], C.red  ],
        ];
        const vColW = (CONTENT_W - 4) / 2;
        let maxVY = y;
        verdictCols.forEach(([label, items, rgb], vi) => {
            const vx = MARGIN + vi * (vColW + 4);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(rgb[0], rgb[1], rgb[2]);
            doc.text(label, vx, y + 1);
            let vy = y + 6;
            vy = bulletList(doc, items, vx, vy, vColW + 2, C.light, rgb);
            maxVY = Math.max(maxVY, vy);
        });
        y = maxVY + 4;
    }

    // ── Add footers to all pages ──────────────────────────────────────────────
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        drawFooter(doc, p, totalPages, roleName);
    }

    const filename = `Interview_Report_${roleName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
}

export const generateResumeReport = (resume: Resume) => {
    const doc = new jsPDF();
    const overallScore = Math.round(resume.analytics?.overall_score || resume.analytics?.cv_quality?.overall_score || 0);

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243); // Blue color
    doc.text('Resume Analysis Report', 105, 15, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(resume.filename, 14, 30);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

    // Score
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    let scoreColor = [220, 53, 69]; // Red
    let grade = 'Needs Improvement';
    if (overallScore >= 80) { scoreColor = [40, 167, 69]; grade = 'Excellent'; } // Green
    else if (overallScore >= 60) { scoreColor = [0, 123, 255]; grade = 'Good'; } // Blue
    else if (overallScore >= 40) { scoreColor = [255, 193, 7]; grade = 'Average'; } // Yellow

    doc.text(`Overall Score: ${overallScore}/100`, 150, 30, { align: 'right' });
    doc.setFontSize(10);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(grade, 150, 36, { align: 'right' });

    // --- Quality Assessment Table ---
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Quality Assessment', 14, 50);

    const sections = (resume.analytics as any).sections || resume.analytics?.cv_quality?.subscores || [];
    let tableData = [];

    if (Array.isArray(sections)) {
        tableData = sections.map((sub: any) => [
            sub.dimension.replace(/_/g, " "),
            `${sub.score} / ${sub.max_score}`,
            sub.evidence?.join('\n') || ''
        ]);
    } else {
        tableData = Object.entries(sections).map(([key, section]: [string, any]) => [
            key.replace(/_/g, " "),
            `${section.score.toFixed(1)} / 10`,
            section.feedback
        ]);
    }

    autoTable(doc, {
        startY: 55,
        head: [['Dimension', 'Score', 'Details']],
        body: tableData,
        headStyles: { fillColor: [66, 66, 66] },
        columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 25 },
            2: { cellWidth: 'auto' }
        }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 15;

    // --- Insights ---
    const strengths = (resume.analytics as any).strengths || resume.analytics?.key_takeaways?.green_flags || [];
    const weaknesses = (resume.analytics as any).weaknesses || resume.analytics?.key_takeaways?.red_flags || [];

    if (strengths.length > 0) {
        if (finalY > 250) { doc.addPage(); finalY = 20; }
        doc.setFontSize(14);
        doc.setTextColor(40, 167, 69); // Green
        doc.text('Strengths', 14, finalY);
        doc.setFontSize(10);
        doc.setTextColor(0);
        strengths.forEach((item: string) => {
            finalY += 6;
            doc.text(`• ${item}`, 14, finalY);
        });
        finalY += 10;
    }

    if (weaknesses.length > 0) {
        if (finalY > 250) { doc.addPage(); finalY = 20; }
        doc.setFontSize(14);
        doc.setTextColor(220, 53, 69); // Red
        doc.text('Areas for Improvement', 14, finalY);
        doc.setFontSize(10);
        doc.setTextColor(0);
        weaknesses.forEach((item: string) => {
            finalY += 6;
            doc.text(`• ${item}`, 14, finalY);
        });
        finalY += 10;
    }

    // --- AI Enhancements (Tailored Resume) ---
    if (resume.enhancement?.tailored_resume) {
        doc.addPage();
        finalY = 20;
        doc.setFontSize(16);
        doc.setTextColor(33, 150, 243);
        doc.text('AI Enhanced Recommendations', 14, finalY);

        finalY += 10;
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Tailored Professional Summary', 14, finalY);
        finalY += 6;
        doc.setFontSize(10);
        const splitSummary = doc.splitTextToSize(resume.enhancement.tailored_resume.summary, 180);
        doc.text(splitSummary, 14, finalY);
        finalY += (splitSummary.length * 5) + 5;

        // Skills
        if (resume.enhancement.tailored_resume.skills?.length > 0) {
            doc.setFontSize(12);
            doc.text('Recommended Skills', 14, finalY);
            finalY += 6;
            doc.setFontSize(10);
            doc.text(resume.enhancement.tailored_resume.skills.join(', '), 14, finalY);
            finalY += 10;
        }
    }
    // --- Gap Analysis ---
    if (resume.enhancement?.top_1_percent_gap) {
        if (finalY > 230) { doc.addPage(); finalY = 20; }
        else finalY += 10;

        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text('Top 1% Analysis', 14, finalY);

        const gaps = resume.enhancement.top_1_percent_gap.gaps || [];
        const actions = resume.enhancement.top_1_percent_gap.actionable_next_steps || [];

        if (gaps.length > 0) {
            finalY += 8;
            doc.setFontSize(11);
            doc.setTextColor(220, 53, 69);
            doc.text('Critical Gaps:', 14, finalY);
            doc.setTextColor(0);
            doc.setFontSize(10);
            gaps.forEach((g: string) => {
                finalY += 5;
                doc.text(`- ${g}`, 14, finalY);
            });
        }

        if (actions.length > 0) {
            finalY += 8;
            doc.setFontSize(11);
            doc.setTextColor(40, 167, 69);
            doc.text('Action Plan:', 14, finalY);
            doc.setTextColor(0);
            doc.setFontSize(10);
            actions.forEach((a: string) => {
                finalY += 5;
                doc.text(`- ${a}`, 14, finalY);
            });
        }
    }

    // --- Trademark/Footer ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('© 2026 AI Interview Coach™ | Confidential & Proprietary', 105, 290, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: 'right' });

        // Add a small logo-like text or actual trademark
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(33, 150, 243);
        doc.text('AI Interview Coach', 14, 290);
    }

    // Save the PDF
    doc.save(`Resume_Analysis_${resume.filename.replace(/\.[^/.]+$/, "")}.pdf`);
};
