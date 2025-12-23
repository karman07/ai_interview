import PyPDF2
from io import BytesIO
from typing import Optional

def extract_text_from_pdf(pdf_content: bytes) -> str:
    """Extract text from PDF bytes."""
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_content))
        text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        if not text.strip():
            raise ValueError("No text could be extracted from PDF")
        
        return text.strip()
    except Exception as e:
        raise ValueError(f"Error extracting PDF text: {str(e)}")

def process_text_input(text: str) -> str:
    """Clean and process text input."""
    return text.strip() if text else ""