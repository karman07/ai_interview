// @ts-ignore
import html2pdf from 'html2pdf.js';

/**
 * html2canvas does not resolve CSS custom properties (var(--primary-color) etc.).
 * This function walks every node in the clone and inlines the *computed* color
 * values from the live DOM so colours are preserved exactly as seen on screen.
 */
function inlineComputedColors(live: Element, cloned: Element) {
    const liveStyle = window.getComputedStyle(live as HTMLElement);
    const el = cloned as HTMLElement;

    const props = [
        'color',
        'background-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'outline-color',
        'text-decoration-color',
        'fill',
        'stroke',
    ];

    for (const prop of props) {
        const val = liveStyle.getPropertyValue(prop);
        if (val && val !== '' && val !== 'rgba(0, 0, 0, 0)') {
            el.style.setProperty(prop, val, 'important');
        }
    }

    // Also resolve any remaining CSS custom properties used as inline vars
    const inlineStyle = (live as HTMLElement).style;
    for (let i = 0; i < inlineStyle.length; i++) {
        const name = inlineStyle.item(i);
        if (name.startsWith('--')) {
            el.style.setProperty(name, inlineStyle.getPropertyValue(name));
        }
    }

    const liveChildren = live.children;
    const clonedChildren = cloned.children;
    for (let i = 0; i < liveChildren.length; i++) {
        if (clonedChildren[i]) {
            inlineComputedColors(liveChildren[i], clonedChildren[i]);
        }
    }
}

/**
 * Generates and directly downloads a PDF of the resume element.
 * - Renders at exactly A4 pixel width (794px @ 96dpi) to prevent clipping.
 * - Inlines all computed colours so CSS variables are preserved in the output.
 * - No print dialog, no browser watermarks.
 */
export const generatePDF = (elementId: string, filename: string = 'resume.pdf') => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id '${elementId}' not found`);
        return;
    }

    const A4_PX = 794;

    // Off-screen wrapper at A4 width
    const wrapper = document.createElement('div');
    wrapper.style.cssText = [
        'position: fixed',
        'top: -99999px',
        'left: -99999px',
        `width: ${A4_PX}px`,
        'overflow: visible',
        'background: white',
        'z-index: -1',
    ].join(';');

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.cssText = [
        `width: ${A4_PX}px`,
        `max-width: ${A4_PX}px`,
        'min-height: auto',
        'box-shadow: none',
        'margin: 0',
        'padding: 32px',
        'background: white',
        'box-sizing: border-box',
        'overflow: visible',
    ].join(';');

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Inline every computed colour from the live element tree into the clone
    inlineComputedColors(element, clone);

    const opt = {
        margin: 0,
        filename,
        image: { type: 'jpeg' as const, quality: 0.99 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            removeContainer: false,
            width: A4_PX,
            windowWidth: A4_PX,
            backgroundColor: '#ffffff',
        },
        jsPDF: {
            unit: 'mm' as const,
            format: 'a4' as const,
            orientation: 'portrait' as const,
            compress: true,
        },
    };

    html2pdf()
        .set(opt)
        .from(clone)
        .save()
        .finally(() => {
            if (document.body.contains(wrapper)) {
                document.body.removeChild(wrapper);
            }
        });
};
