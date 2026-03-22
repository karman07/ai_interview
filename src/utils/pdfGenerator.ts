import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Resume } from '@/types/Resume';
import type { InterviewV2Report } from '@/api/interviewV2';

// ─────────────────────────────────────────────────────────────────────────────
// Interview Report PDF Generator  —  Clean Light Edition
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_W    = 210;
const PAGE_H    = 297;
const MARGIN    = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Light-theme palette
const L = {
    white   : [255, 255, 255] as [number, number, number],
    bg      : [249, 250, 252] as [number, number, number], // page background (near-white)
    card    : [255, 255, 255] as [number, number, number],
    border  : [220, 224, 235] as [number, number, number],
    divider : [234, 236, 244] as [number, number, number],

    // header band
    headerBg : [30,  36,  70]  as [number, number, number], // deep navy strip only in header
    headerBg2: [44,  52,  94]  as [number, number, number],

    // accents
    violet   : [99,  91, 235]  as [number, number, number],
    violetLt : [220, 218, 255] as [number, number, number],
    teal     : [16, 185, 129]  as [number, number, number],
    tealLt   : [209, 250, 229] as [number, number, number],
    amber    : [217, 119,   6] as [number, number, number],
    amberLt  : [254, 243, 199] as [number, number, number],
    red      : [220,  38,  38] as [number, number, number],
    redLt    : [254, 226, 226] as [number, number, number],
    green    : [5,  150,  105] as [number, number, number],
    greenLt  : [209, 250, 229] as [number, number, number],

    // text
    textDark : [17,  24,  39]  as [number, number, number],
    textMid  : [75,  85, 100]  as [number, number, number],
    textDim  : [156, 163, 175] as [number, number, number],
};

// ─── Pure utilities ───────────────────────────────────────────────────────────

function scoreAccent(s: number): [number, number, number] {
    if (s >= 75) return L.teal;
    if (s >= 50) return L.amber;
    return L.red;
}
function scoreBg(s: number): [number, number, number] {
    if (s >= 75) return L.tealLt;
    if (s >= 50) return L.amberLt;
    return L.redLt;
}

function clamp(text: string, max: number) {
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
}
function safeStr(v: unknown): string {
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object' && 'name' in v) return String((v as any).name);
    return String(v ?? '');
}

// ─── Drawing primitives ──────────────────────────────────────────────────────

function fillRect(doc: jsPDF, x: number, y: number, w: number, h: number, rgb: [number, number, number]) {
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(x, y, w, h, 'F');
}
function fillRR(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, rgb: [number, number, number]) {
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.roundedRect(x, y, w, h, r, r, 'F');
}
function strokeRR(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, rgb: [number, number, number], lw = 0.3) {
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.setLineWidth(lw);
    doc.roundedRect(x, y, w, h, r, r, 'S');
}

/** Smooth arc segments for the score ring */
function drawArc(doc: jsPDF, cx: number, cy: number, radius: number, startDeg: number, endDeg: number, lw: number, rgb: [number, number, number], steps = 72) {
    if (startDeg >= endDeg) return;
    const s = (startDeg - 90) * (Math.PI / 180);
    const e = (endDeg   - 90) * (Math.PI / 180);
    const inc = (e - s) / steps;
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.setLineWidth(lw);
    for (let i = 0; i < steps; i++) {
        const a1 = s + i * inc, a2 = s + (i + 1) * inc;
        doc.line(cx + radius * Math.cos(a1), cy + radius * Math.sin(a1),
                 cx + radius * Math.cos(a2), cy + radius * Math.sin(a2));
    }
}

/** Score ring (light version — white centre, coloured arc on light track) */
function scoreRing(doc: jsPDF, cx: number, cy: number, r: number, score: number) {
    const accent = scoreAccent(score);
    // track
    drawArc(doc, cx, cy, r, -135, 135, 3.5, L.divider);
    // fill arc
    const endDeg = -135 + (Math.min(score, 100) / 100) * 270;
    drawArc(doc, cx, cy, r, -135, endDeg, 3.5, accent);
    // white centre
    doc.setFillColor(255, 255, 255);
    doc.circle(cx, cy, r - 5, 'F');
    // score text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text(`${score}`, cx, cy + 3.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...L.textDim);
    doc.text('/100', cx, cy + 9.5, { align: 'center' });
}

/** Simple horizontal bar (light style) */
function bar(doc: jsPDF, x: number, y: number, w: number, h: number, pct: number, accent: [number, number, number]) {
    const R = h / 2;
    fillRR(doc, x, y, w, h, R, L.divider);
    if (pct > 0) {
        const fw = Math.max(w * Math.min(pct / 100, 1), h);
        doc.setFillColor(accent[0], accent[1], accent[2]);
        doc.roundedRect(x, y, fw, h, R, R, 'F');
    }
}

/** Section heading — thin accent left bar + bold label */
function secHead(doc: jsPDF, y: number, title: string): number {
    // separator line above each section
    doc.setDrawColor(L.divider[0], L.divider[1], L.divider[2]);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    // accent pin
    fillRect(doc, MARGIN, y + 2, 3, 7, L.violet);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...L.textDark);
    doc.text(title, MARGIN + 6, y + 8);
    return y + 15;
}

/** Add page with white/near-white background */
function ensureSpace(doc: jsPDF, y: number, needed: number): number {
    if (y + needed > PAGE_H - 18) {
        doc.addPage();
        fillRect(doc, 0, 0, PAGE_W, PAGE_H, L.bg);
        return 16;
    }
    return y;
}

/** Bullet list — returns new y */
function bulletList(doc: jsPDF, items: string[], x: number, y: number, maxW: number,
    textRgb: [number, number, number] = L.textMid,
    dotRgb:  [number, number, number] = L.violet): number {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    for (const raw of items) {
        y = ensureSpace(doc, y, 8);
        doc.setFillColor(dotRgb[0], dotRgb[1], dotRgb[2]);
        doc.circle(x + 1.5, y - 1.5, 1, 'F');
        doc.setTextColor(textRgb[0], textRgb[1], textRgb[2]);
        const lines = doc.splitTextToSize(safeStr(raw), maxW - 6);
        doc.text(lines, x + 5, y);
        y += lines.length * 5;
    }
    return y;
}

/** Footer */
function drawFooter(doc: jsPDF, pageNum: number, totalPages: number, role: string) {
    const fy = PAGE_H - 7;
    doc.setDrawColor(L.divider[0], L.divider[1], L.divider[2]);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...L.textDim);
    doc.text('AI for Job™  ·  Interview Performance Report', MARGIN, fy);
    doc.text(clamp(role, 40), PAGE_W / 2, fy, { align: 'center' });
    doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MARGIN, fy, { align: 'right' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export function generateInterviewReport(report: InterviewV2Report, role?: string, roundType?: string): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

    const rawScore  = report.summary?.overall_score ?? 0;
    const scoreNorm = Math.min(100, Math.round(rawScore <= 10 ? rawScore * 10 : rawScore));
    const roleName  = role      ?? 'Interview Report';
    const roundName = roundType ?? 'General';
    const dateStr   = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const hireRec   = report.summary?.hire_recommendation ?? '';

    const hireAccent: [number, number, number] =
        hireRec.toLowerCase().includes('strong') || hireRec.toLowerCase().includes('yes') ? L.green
        : hireRec.toLowerCase().includes('consider') || hireRec.toLowerCase().includes('maybe') ? L.amber
        : L.red;
    const hireBg: [number, number, number] =
        hireAccent === L.green ? L.greenLt : hireAccent === L.amber ? L.amberLt : L.redLt;

    // ── Background (all pages start white) ───────────────────────────────────
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, L.bg);

    // ── HEADER BANNER ─────────────────────────────────────────────────────────
    fillRect(doc, 0, 0, PAGE_W, 52, L.headerBg);
    fillRect(doc, 0, 0, PAGE_W, 52, L.headerBg);
    // left accent stripe
    fillRect(doc, 0, 0, 4, 52, L.violet);

    // Brand line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(L.violetLt[0], L.violetLt[1], L.violetLt[2]);
    doc.text('AI FOR JOB™', MARGIN + 5, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(160, 165, 200);
    doc.text('Candidate Assessment Platform', MARGIN + 5, 17);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(19);
    doc.setTextColor(255, 255, 255);
    doc.text('Interview Performance Report', MARGIN + 5, 32);

    // Sub-info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 185, 215);
    doc.text(`${roundName.toUpperCase()} ROUND  ·  ${roleName}`, MARGIN + 5, 40);
    doc.setFontSize(7);
    doc.setTextColor(120, 130, 170);
    doc.text(`Generated on ${dateStr}`, MARGIN + 5, 47);

    // Score ring — top right of header
    scoreRing(doc, PAGE_W - 28, 30, 18, scoreNorm);

    // ── HIRE BADGE + INFO CARDS (below header on white bg) ───────────────────
    let y = 60;

    // Hire recommendation badge
    const hireLabel = hireRec || 'Under Review';
    const hireW     = Math.min(Math.max(hireLabel.length * 2.4 + 16, 40), 80);
    fillRR(doc, MARGIN, y, hireW, 8, 4, hireBg);
    strokeRR(doc, MARGIN, y, hireW, 8, 4, hireAccent, 0.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(hireAccent[0], hireAccent[1], hireAccent[2]);
    doc.text(clamp(hireLabel, 26), MARGIN + hireW / 2, y + 5.5, { align: 'center' });

    y += 13;

    // Info cards (seniority / confidence / round)
    const cardW = (CONTENT_W - 8) / 3;
    const infoCards: Array<{ label: string; value: string; accent: [number, number, number]; bg: [number, number, number] }> = [
        { label: 'Seniority Level',  value: report.summary?.seniority_assessment  ?? '—', accent: L.violet, bg: L.violetLt },
        { label: 'Confidence',       value: report.summary?.confidence_assessment ?? '—', accent: L.teal,   bg: L.tealLt   },
        { label: 'Interview Round',  value: roundName,                                    accent: L.amber,  bg: L.amberLt  },
    ];
    infoCards.forEach((card, i) => {
        const cx = MARGIN + i * (cardW + 4);
        fillRR(doc, cx, y, cardW, 18, 3, L.card);
        strokeRR(doc, cx, y, cardW, 18, 3, L.border, 0.3);
        // left colour accent
        fillRR(doc, cx, y, 3, 18, 1, card.accent);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...L.textDim);
        doc.text(card.label.toUpperCase(), cx + 7, y + 7);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...L.textDark);
        doc.text(clamp(safeStr(card.value), 18), cx + 7, y + 14.5);
    });
    y += 26;

    // ── PERFORMANCE DIMENSIONS ────────────────────────────────────────────────
    y = secHead(doc, y, 'PERFORMANCE DIMENSIONS');

    const dims: Array<[string, number]> = [
        ['Technical Depth',  report.dimension_scores?.technical_depth  ?? 0],
        ['Problem Solving',  report.dimension_scores?.problem_solving   ?? 0],
        ['System Design',    report.dimension_scores?.system_design     ?? 0],
        ['Communication',    report.dimension_scores?.communication     ?? 0],
        ['Role Fit',         report.dimension_scores?.role_fit          ?? 0],
    ];
    const dimCW = (CONTENT_W - 6) / 2;
    dims.forEach(([label, raw], i) => {
        const score  = Math.min(100, raw <= 10 ? raw * 10 : raw);
        const accent = scoreAccent(score);
        const bg     = scoreBg(score);
        const col = i % 2, row = Math.floor(i / 2);
        const dx = MARGIN + col * (dimCW + 6);
        const dy = y + row * 16;

        fillRR(doc, dx, dy, dimCW, 13, 2, L.card);
        strokeRR(doc, dx, dy, dimCW, 13, 2, L.border, 0.3);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...L.textMid);
        doc.text(label, dx + 5, dy + 6);

        bar(doc, dx + 5, dy + 8, dimCW - 30, 3.5, score, accent);

        // Score pill
        fillRR(doc, dx + dimCW - 18, dy + 3.5, 15, 7, 3.5, bg);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(accent[0], accent[1], accent[2]);
        doc.text(`${score}`, dx + dimCW - 10.5, dy + 9, { align: 'center' });
    });
    y += Math.ceil(dims.length / 2) * 16 + 6;

    // ── KEY STRENGTHS & AREAS TO IMPROVE ─────────────────────────────────────
    y = ensureSpace(doc, y, 40);
    y = secHead(doc, y, 'KEY STRENGTHS & AREAS TO IMPROVE');

    const halfW   = (CONTENT_W - 5) / 2;
    const strList = report.summary?.key_strengths             ?? [];
    const impList = report.summary?.key_areas_for_improvement ?? [];

    // Column headers
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...L.teal);
    doc.text('Key Strengths', MARGIN, y + 1);
    doc.setTextColor(...L.red);
    doc.text('Areas to Improve', MARGIN + halfW + 5, y + 1);

    doc.setDrawColor(L.teal[0], L.teal[1], L.teal[2]);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, y + 3, MARGIN + halfW, y + 3);
    doc.setDrawColor(L.red[0], L.red[1], L.red[2]);
    doc.line(MARGIN + halfW + 5, y + 3, PAGE_W - MARGIN, y + 3);

    let leftY  = y + 7;
    let rightY = y + 7;
    leftY  = bulletList(doc, strList.slice(0, 6), MARGIN + 1, leftY,  halfW - 3, L.textMid, L.teal);
    rightY = bulletList(doc, impList.slice(0, 6), MARGIN + halfW + 6, rightY, halfW - 3, L.textMid, L.red);
    y = Math.max(leftY, rightY) + 8;

    // ── QUESTION-BY-QUESTION ANALYSIS ────────────────────────────────────────
    const questions = report.question_wise_analysis ?? [];
    if (questions.length > 0) {
        y = ensureSpace(doc, y, 28);
        y = secHead(doc, y, 'QUESTION-BY-QUESTION ANALYSIS');

        for (let qi = 0; qi < questions.length; qi++) {
            const q      = questions[qi];
            const qScore = Math.min(100, Math.round(q.score <= 10 ? q.score * 10 : q.score));
            const accent = scoreAccent(qScore);
            const qBg    = scoreBg(qScore);

            const pillW   = 15;
            const pillGap = pillW + 4;
            doc.setFontSize(8.5);
            const qText  = safeStr(q.question);
            const qLines = doc.splitTextToSize(qText, CONTENT_W - 14 - pillGap);
            const qBarH  = Math.max(qLines.length * 5.2 + 7, 12);

            y = ensureSpace(doc, y, qBarH + 5);

            // Question row background
            fillRR(doc, MARGIN, y, CONTENT_W, qBarH, 2, L.card);
            strokeRR(doc, MARGIN, y, CONTENT_W, qBarH, 2, L.border, 0.25);
            // left accent
            fillRR(doc, MARGIN, y, 3, qBarH, 1, L.violet);

            // Q-number
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(...L.violet);
            doc.text(`Q${qi + 1}`, MARGIN + 6, y + qBarH / 2 + 1.5, { align: 'center' });

            // Question text
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(...L.textDark);
            doc.text(qLines, MARGIN + 10, y + 6.5);

            // Score pill
            fillRR(doc, PAGE_W - MARGIN - pillW - 1, y + (qBarH - 7) / 2, pillW, 7, 3.5, qBg);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(accent[0], accent[1], accent[2]);
            doc.text(`${qScore}`, PAGE_W - MARGIN - pillW / 2 - 1, y + (qBarH - 7) / 2 + 5, { align: 'center' });

            y += qBarH + 3;

            // Answer summary
            if (q.user_answer_summary) {
                const aLines = doc.splitTextToSize(safeStr(q.user_answer_summary), CONTENT_W - 10);
                const aH = aLines.length * 5 + 10;
                y = ensureSpace(doc, y, aH + 3);
                fillRR(doc, MARGIN, y, CONTENT_W, aH, 2, L.amberLt);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6.5);
                doc.setTextColor(...L.amber);
                doc.text('ANSWER SUMMARY', MARGIN + 5, y + 5.5);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...L.textMid);
                doc.text(aLines, MARGIN + 5, y + 10.5);
                y += aH + 3;
            }

            // Eval chips (strengths + weaknesses)
            const eStr  = (q.evaluation?.strengths  ?? []).slice(0, 3).map(safeStr);
            const eWeak = (q.evaluation?.weaknesses ?? []).slice(0, 3).map(safeStr);
            const renderChips = (items: string[], chipAccent: [number, number, number], chipBg: [number, number, number]) => {
                if (!items.length) return;
                y = ensureSpace(doc, y, 8);
                let cx2 = MARGIN + 1;
                items.forEach(item => {
                    const label = item.length > 40 ? item.slice(0, 39) + '…' : item;
                    doc.setFontSize(6.5);
                    const tw = doc.getTextWidth(label) + 7;
                    if (cx2 + tw > PAGE_W - MARGIN) { cx2 = MARGIN + 1; y += 7; y = ensureSpace(doc, y, 7); }
                    fillRR(doc, cx2, y - 4.5, tw, 6, 3, chipBg);
                    strokeRR(doc, cx2, y - 4.5, tw, 6, 3, chipAccent, 0.25);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(chipAccent[0], chipAccent[1], chipAccent[2]);
                    doc.text(label, cx2 + tw / 2, y, { align: 'center' });
                    cx2 += tw + 3;
                });
                y += 7;
            };
            renderChips(eStr,  L.teal, L.tealLt);
            renderChips(eWeak, L.red,  L.redLt);

            // Thin divider between questions
            doc.setDrawColor(L.divider[0], L.divider[1], L.divider[2]);
            doc.setLineWidth(0.2);
            doc.line(MARGIN, y + 1, PAGE_W - MARGIN, y + 1);
            y += 6;
        }
    }

    // ── SKILL GAP ANALYSIS ────────────────────────────────────────────────────
    const gaps = report.skill_gap_analysis;
    if (gaps) {
        y = ensureSpace(doc, y, 28);
        y = secHead(doc, y, 'SKILL GAP ANALYSIS');

        const gapCols: Array<[string, string[], [number,number,number], [number,number,number]]> = [
            ['Critical Gaps',  gaps.critical_gaps  ?? [], L.red,   L.redLt   ],
            ['Moderate Gaps',  gaps.moderate_gaps  ?? [], L.amber, L.amberLt ],
            ['Minor Gaps',     gaps.minor_gaps     ?? [], L.teal,  L.tealLt  ],
        ];
        const gapW = (CONTENT_W - 8) / 3;
        let maxGapY = y;

        gapCols.forEach(([label, items, accent, bg], gi) => {
            const gx = MARGIN + gi * (gapW + 4);
            fillRR(doc, gx, y, gapW, 7, 2, bg);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(accent[0], accent[1], accent[2]);
            doc.text(label, gx + 4, y + 5);
            let gy = y + 11;
            items.slice(0, 6).forEach(item => {
                gy = ensureSpace(doc, gy, 8);
                doc.setFillColor(accent[0], accent[1], accent[2]);
                doc.circle(gx + 2.5, gy - 1.5, 1, 'F');
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...L.textMid);
                const lines = doc.splitTextToSize(safeStr(item), gapW - 7);
                doc.text(lines, gx + 6, gy);
                gy += lines.length * 5;
            });
            maxGapY = Math.max(maxGapY, gy);
        });
        y = maxGapY + 8;
    }

    // ── BEHAVIORAL INSIGHTS ───────────────────────────────────────────────────
    const bi = report.behavioral_insights;
    if (bi) {
        y = ensureSpace(doc, y, 30);
        y = secHead(doc, y, 'BEHAVIORAL INSIGHTS');

        const biRows: Array<{ label: string; value: string; accent: [number,number,number]; bg: [number,number,number] }> = [
            { label: 'Communication Style', value: bi.communication_style ?? '—', accent: L.violet, bg: L.violetLt },
            { label: 'Thinking Pattern',    value: bi.thinking_pattern    ?? '—', accent: L.teal,   bg: L.tealLt   },
            { label: 'Pressure Handling',   value: bi.pressure_handling   ?? '—', accent: L.amber,  bg: L.amberLt  },
        ];
        biRows.forEach(row => {
            const valLines = doc.splitTextToSize(safeStr(row.value), CONTENT_W - 44);
            const cardH    = Math.max(valLines.length * 5 + 10, 14);
            y = ensureSpace(doc, y, cardH + 4);
            fillRR(doc, MARGIN, y, CONTENT_W, cardH, 2, L.card);
            strokeRR(doc, MARGIN, y, CONTENT_W, cardH, 2, L.border, 0.3);
            fillRR(doc, MARGIN, y, 3, cardH, 1, row.accent);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(row.accent[0], row.accent[1], row.accent[2]);
            doc.text(row.label, MARGIN + 7, y + 6);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(...L.textMid);
            doc.text(valLines, MARGIN + 7, y + 11.5);
            y += cardH + 4;
        });
        y += 3;
    }

    // ── IMPROVEMENT PLAN ──────────────────────────────────────────────────────
    const plan = report.improvement_plan;
    if (plan) {
        y = ensureSpace(doc, y, 28);
        y = secHead(doc, y, 'IMPROVEMENT PLAN');

        const planCols: Array<[string, string[], [number,number,number], [number,number,number]]> = [
            ['Immediate Actions', plan.immediate_actions ?? [], L.red,   L.redLt   ],
            ['1-Week Plan',       plan.plan_1_week       ?? [], L.amber, L.amberLt ],
            ['1-Month Plan',      plan.plan_1_month      ?? [], L.teal,  L.tealLt  ],
        ];
        const planW = (CONTENT_W - 8) / 3;
        let maxPlanY = y;

        planCols.forEach(([label, items, accent, bg], pi) => {
            const px = MARGIN + pi * (planW + 4);
            fillRR(doc, px, y, planW, 7, 2, bg);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(accent[0], accent[1], accent[2]);
            doc.text(label, px + 4, y + 5);
            let py = y + 11;
            items.slice(0, 6).forEach((item, idx) => {
                py = ensureSpace(doc, py, 10);
                // number badge
                fillRR(doc, px, py - 4, 5.5, 5.5, 2, bg);
                strokeRR(doc, px, py - 4, 5.5, 5.5, 2, accent, 0.3);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6.5);
                doc.setTextColor(accent[0], accent[1], accent[2]);
                doc.text(`${idx + 1}`, px + 2.75, py, { align: 'center' });
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.5);
                doc.setTextColor(...L.textMid);
                const lines = doc.splitTextToSize(safeStr(item), planW - 9);
                doc.text(lines, px + 8, py);
                py += lines.length * 4.8 + 2.5;
            });
            maxPlanY = Math.max(maxPlanY, py);
        });
        y = maxPlanY + 8;
    }

    // ── FINAL VERDICT ─────────────────────────────────────────────────────────
    const verdict = report.verdict;
    if (verdict) {
        y = ensureSpace(doc, y, 36);
        y = secHead(doc, y, 'FINAL VERDICT');

        // Recommendation box
        if (verdict.final_recommendation_text) {
            const recLines = doc.splitTextToSize(safeStr(verdict.final_recommendation_text), CONTENT_W - 10);
            const boxH     = recLines.length * 5.5 + 12;
            y = ensureSpace(doc, y, boxH + 6);
            fillRR(doc, MARGIN, y, CONTENT_W, boxH, 3, L.violetLt);
            fillRR(doc, MARGIN, y, 3, boxH, 1, L.violet);
            doc.setFont('helvetica', 'bolditalic');
            doc.setFontSize(9);
            doc.setTextColor(...L.violet);
            doc.text(recLines, MARGIN + 8, y + 9);
            y += boxH + 8;
        }

        // Two columns
        const vW = (CONTENT_W - 5) / 2;
        const vCols: Array<[string, string[], [number,number,number], [number,number,number]]> = [
            ['Highlight These',           verdict.strengths_to_highlight            ?? [], L.teal, L.tealLt ],
            ['Fix Before Next Interview', verdict.areas_to_fix_before_next_interview ?? [], L.red,  L.redLt  ],
        ];
        let maxVY = y;
        vCols.forEach(([label, items, accent], vi) => {
            const vx = MARGIN + vi * (vW + 5);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(accent[0], accent[1], accent[2]);
            doc.text(label, vx, y + 1);
            doc.setDrawColor(accent[0], accent[1], accent[2]);
            doc.setLineWidth(0.25);
            doc.line(vx, y + 3, vx + vW, y + 3);
            let vy = y + 7;
            vy = bulletList(doc, items, vx + 1, vy, vW - 3, L.textMid, accent);
            maxVY = Math.max(maxVY, vy);
        });
        y = maxVY + 6;
    }

    // ── FOOTERS ───────────────────────────────────────────────────────────────
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        // ensure white bg on each page
        if (p > 1) fillRect(doc, 0, 0, PAGE_W, PAGE_H, L.bg);
        drawFooter(doc, p, totalPages, roleName);
    }

    doc.save(`Interview_Report_${roleName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
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

// ─────────────────────────────────────────────────────────────────────────────
// Text-based Resume PDF Generator
// Uses jsPDF text methods — produces a real text layer for ATS parsing.
// ─────────────────────────────────────────────────────────────────────────────

export function generateResumeFromBuilderData(
    resumeData: { resume_content: any },
    filename?: string
) {
    const rc = resumeData?.resume_content ?? (resumeData as any);
    const pi = rc?.personal_info ?? {};
    const name: string = pi?.name || pi?.fullName || pi?.full_name || 'Resume';

    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    // ── Platform metadata (used for origin detection on re-upload) ─────────────
    doc.setProperties({
        title: name,
        creator: 'AIForJob-Platform',
        keywords: 'aiforjob-platform-generated',
        subject: 'AIForJob-Platform-Generated-Resume',
    });
    // Invisible marker text (font-size 1pt, white on white) — survives in the PDF
    // text layer so pdf-parse picks it up even when metadata is stripped by a tool.
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(1);
    doc.setTextColor(255, 255, 255);
    doc.text('AIFORJOB-PLATFORM-GENERATED-v1', 0, 1);

    const PW = 210, ML = 14, MR = 14, CW = PW - ML - MR;
    let y = 18;

    const primary: [number, number, number] = [37, 99, 235];   // blue-600
    const dark:    [number, number, number] = [17, 24, 39];
    const mid:     [number, number, number] = [75, 85, 100];
    const rule:    [number, number, number] = [229, 231, 235];

    const addPage = () => { doc.addPage(); y = 18; };
    const checkY = (need: number) => { if (y + need > 280) addPage(); };

    const hline = (yPos: number) => {
        doc.setDrawColor(...rule);
        doc.setLineWidth(0.3);
        doc.line(ML, yPos, PW - MR, yPos);
    };

    const section = (title: string) => {
        checkY(10);
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...primary);
        doc.text(title.toUpperCase(), ML, y);
        y += 1.5;
        hline(y);
        y += 4;
        doc.setTextColor(...dark);
    };

    const wrap = (text: string, x: number, maxW: number, size: number, style: string): number => {
        doc.setFont('helvetica', style);
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text ?? '', maxW);
        checkY(lines.length * (size * 0.4));
        doc.text(lines, x, y);
        y += lines.length * (size * 0.4) + 1;
        return y;
    };

    // ── Name ──────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...primary);
    doc.text(name, ML, y);
    y += 7;

    // ── Contact row ───────────────────────────────────────────────────────────
    const contacts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github, pi.website]
        .filter(Boolean).join('  •  ');
    if (contacts) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...mid);
        doc.text(contacts, ML, y);
        y += 4;
    }
    hline(y); y += 5;

    // ── Summary ───────────────────────────────────────────────────────────────
    const summary: string = rc?.professional_summary ?? rc?.summary ?? '';
    if (summary) {
        section('Professional Summary');
        wrap(summary, ML, CW, 9, 'normal');
    }

    // ── Skills ────────────────────────────────────────────────────────────────
    const skills = rc?.skills ?? {};
    const skillGroups: { label: string; items: string[] }[] = [];
    const addSkillGroup = (label: string, items: any) => {
        const arr = Array.isArray(items) ? items.filter(Boolean) : [];
        if (arr.length) skillGroups.push({ label, items: arr });
    };
    addSkillGroup('Programming Languages', skills?.programming_languages ?? skills?.frontend);
    addSkillGroup('Frameworks', skills?.frameworks ?? skills?.backend);
    addSkillGroup('Tools', skills?.tools ?? skills?.tools_cloud);
    addSkillGroup('Other', skills?.other);
    if (skillGroups.length) {
        section('Skills');
        for (const g of skillGroups) {
            checkY(5);
            doc.setFont('helvetica', 'bold');   doc.setFontSize(9); doc.setTextColor(...dark);
            doc.text(`${g.label}:`, ML, y);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...mid);
            const val = doc.splitTextToSize(g.items.join(', '), CW - 40);
            doc.text(val, ML + 40, y);
            y += val.length * 3.8 + 1.2;
        }
    }

    // ── Experience ────────────────────────────────────────────────────────────
    const experience: any[] = rc?.experience ?? [];
    if (experience.length) {
        section('Work Experience');
        for (const job of experience) {
            checkY(12);
            const title: string = job?.title ?? job?.role ?? '';
            const duration: string = job?.duration ?? '';
            doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...dark);
            doc.text(title, ML, y);
            if (duration) {
                doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...mid);
                doc.text(duration, PW - MR, y, { align: 'right' });
            }
            y += 4;
            doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(9); doc.setTextColor(...primary);
            doc.text([job?.company, job?.location].filter(Boolean).join('  —  '), ML, y);
            y += 4.5;
            const descs: string[] = Array.isArray(job?.description ?? job?.responsibilities)
                ? (job?.description ?? job?.responsibilities)
                : [job?.description ?? job?.responsibilities].filter(Boolean);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...dark);
            for (const d of descs) {
                const lines = doc.splitTextToSize(`• ${d}`, CW - 4);
                checkY(lines.length * 3.6);
                doc.text(lines, ML + 2, y);
                y += lines.length * 3.6 + 0.8;
            }
            y += 2;
        }
    }

    // ── Projects ──────────────────────────────────────────────────────────────
    const projects: any[] = rc?.projects ?? [];
    if (projects.length) {
        section('Projects');
        for (const proj of projects) {
            checkY(10);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...dark);
            doc.text(proj?.name ?? '', ML, y);
            y += 4;
            if (proj?.technologies?.length) {
                doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(...mid);
                doc.text(proj.technologies.join(', '), ML, y);
                y += 4;
            }
            if (proj?.description) {
                wrap(proj.description, ML + 2, CW - 4, 8.5, 'normal');
            }
            const highlights: string[] = proj?.highlights ?? [];
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...dark);
            for (const h of highlights) {
                const lines = doc.splitTextToSize(`• ${h}`, CW - 4);
                checkY(lines.length * 3.6);
                doc.text(lines, ML + 2, y);
                y += lines.length * 3.6 + 0.8;
            }
            y += 2;
        }
    }

    // ── Education ─────────────────────────────────────────────────────────────
    const education: any[] = rc?.education ?? [];
    if (education.length) {
        section('Education');
        for (const edu of education) {
            checkY(10);
            const degree = [edu?.degree, edu?.field].filter(Boolean).join(' in ');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...dark);
            doc.text(degree, ML, y);
            if (edu?.duration) {
                doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...mid);
                doc.text(edu.duration, PW - MR, y, { align: 'right' });
            }
            y += 4;
            doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(...primary);
            doc.text([edu?.institution, edu?.location].filter(Boolean).join('  —  '), ML, y);
            y += 5;
        }
    }

    // ── Achievements ──────────────────────────────────────────────────────────
    const achievements: string[] = rc?.achievements ?? [];
    if (achievements.length) {
        section('Achievements');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...dark);
        for (const a of achievements) {
            const lines = doc.splitTextToSize(`• ${a}`, CW - 2);
            checkY(lines.length * 3.6);
            doc.text(lines, ML + 2, y);
            y += lines.length * 3.6 + 1;
        }
    }

    // ── Certifications ────────────────────────────────────────────────────────
    const certs: any[] = rc?.certifications ?? [];
    if (certs.length) {
        section('Certifications');
        for (const c of certs) {
            checkY(5);
            const line = typeof c === 'string' ? c
                : [c?.name, c?.issuer, c?.year ?? c?.date].filter(Boolean).join('  •  ');
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...dark);
            const lines = doc.splitTextToSize(`• ${line}`, CW - 2);
            doc.text(lines, ML + 2, y);
            y += lines.length * 3.8 + 1;
        }
    }

    // ── Languages ─────────────────────────────────────────────────────────────
    const langs: any[] = rc?.languages ?? [];
    if (langs.length) {
        section('Languages');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...dark);
        const langStr = langs.map((l: any) =>
            typeof l === 'string' ? l : [l?.language ?? l?.name, l?.proficiency].filter(Boolean).join(' — ')
        ).join('  •  ');
        wrap(langStr, ML, CW, 9, 'normal');
    }

    const safeName = name.replace(/[^a-z0-9_\- ]/gi, '_');
    doc.save(filename ?? `Resume_${safeName}.pdf`);
}
