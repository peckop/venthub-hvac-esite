import sys
import json
from pypdf import PdfReader

def extract_text_from_pdf(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text_content = []
        
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            text_content.append(f"--- Page {i+1} ---\n{text}")
            
        return "\n".join(text_content)
    except Exception as e:
        return f"Error extracting text: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_pdf.py <pdf_path> [output_path]")
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    content = extract_text_from_pdf(pdf_path)
    
    if len(sys.argv) > 2:
        output_path = sys.argv[2]
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Text extracted to: {output_path}")
    else:
        # Force utf-8 for stdout if possible, or just print
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except:
            pass
        print(content)
