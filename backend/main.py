import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import DinatInvoiceDocument, ExcelExportRequest, ExcelExportResponse
from extractor import extract_invoice_data_from_bytes, get_active_model_name
from exporter import generate_or_append_excel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend.main")

app = FastAPI(
    title="PDF Data Extractor API",
    description="Multimodal LLM PDF Data Extraction & Excel Production Engine",
    version="1.0.0"
)

# Configure CORS for local frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "PDF Data Extractor API",
        "version": "1.0.0",
        "model": get_active_model_name()
    }



@app.post("/api/extract", response_model=DinatInvoiceDocument)
async def extract_pdf(file: UploadFile = File(...)):
    """
    Accepts raw PDF upload and uses Multimodal LLM extraction to return structured DinatInvoiceDocument JSON.
    """
    if not file.filename.endswith(".pdf") and file.content_type != "application/pdf":
        logger.warning(f"File uploaded '{file.filename}' is not a PDF")

    try:
        content = await file.read()
        extracted_doc = extract_invoice_data_from_bytes(content, file.filename)
        return extracted_doc
    except Exception as e:
        logger.error(f"Error extracting PDF data: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@app.post("/api/export/excel", response_model=ExcelExportResponse)
def export_excel(payload: ExcelExportRequest):
    """
    Exports approved invoice documents into a new or existing Excel workbook.
    """
    try:
        result = generate_or_append_excel(
            documents=payload.documents,
            file_path=payload.excel_path,
            mode=payload.mode
        )
        return ExcelExportResponse(**result)
    except Exception as e:
        logger.error(f"Excel export error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
