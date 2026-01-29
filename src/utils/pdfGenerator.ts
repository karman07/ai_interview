import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Resume } from '@/types/Resume';

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

    // Save the PDF
    doc.save(`Resume_Analysis_${resume.filename.replace(/\.[^/.]+$/, "")}.pdf`);
};
