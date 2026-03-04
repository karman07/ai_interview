// @ts-ignore
import html2pdf from 'html2pdf.js';

export const generatePDF = (elementId: string, filename: string = 'resume.pdf') => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found`);
        return;
    }

    // Add trademark temporarily to the element's bottom if needed, 
    // but html2pdf captures what's on screen. Better to add it to the template.

    const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
};
