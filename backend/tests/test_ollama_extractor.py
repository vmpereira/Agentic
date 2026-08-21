import os
import sys
import pytest
import requests

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from extractor import extract_with_ollama, parse_pdf_text
from schemas import DinatInvoiceDocument


def is_ollama_running() -> bool:
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=2)
        return r.status_code == 200
    except Exception:
        return False


def get_pdf_text(relative_path: str) -> str:
    full_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../..", relative_path))
    if not os.path.exists(full_path):
        pytest.skip(f"Test file not found: {relative_path}")
    with open(full_path, "rb") as f:
        return parse_pdf_text(f.read())


@pytest.mark.skipif(not is_ollama_running(), reason="Ollama is not running on http://localhost:11434")
def test_ollama_file_01_lagranja():
    text = get_pdf_text("archivos_prueba/01_OC-2026-08-0392_LaGranja_LaColonia-T5-Kennedy_2026-08-16.pdf")
    doc = extract_with_ollama(text, model_name="qwen2.5-coder:7b")
    assert doc is not None, "Ollama extraction returned None"
    assert doc.document_metadata.order_number == "OC-2026-08-0392"
    assert "2026-08-16" in doc.document_metadata.issue_date
    assert len(doc.items) == 2
    assert "06:58" in doc.delivery_status.arrival_time
    assert "07:35" in doc.delivery_status.completion_time
    assert doc.financial_totals.taxable_subtotal > 0


@pytest.mark.skipif(not is_ollama_running(), reason="Ollama is not running on http://localhost:11434")
def test_ollama_file_02_raptor():
    text = get_pdf_text("archivos_prueba/02_OC-2026-08-0378_Raptor_Paiz-Kennedy_2026-08-15.pdf")
    doc = extract_with_ollama(text, model_name="qwen2.5-coder:7b")
    assert doc is not None, "Ollama extraction returned None"
    assert doc.document_metadata.order_number == "OC-2026-08-0378"
    assert "2026-08-15" in doc.document_metadata.issue_date
    assert len(doc.items) == 3
    assert "07:12" in doc.delivery_status.arrival_time
    assert "08:04" in doc.delivery_status.completion_time
    assert doc.financial_totals.taxable_subtotal > 0


@pytest.mark.skipif(not is_ollama_running(), reason="Ollama is not running on http://localhost:11434")
def test_ollama_file_03_mountain_dew():
    text = get_pdf_text("archivos_prueba/03_OC-2026-08-0361_MountainDew_MaxiDespensa-Kennedy_2026-08-14.pdf")
    doc = extract_with_ollama(text, model_name="qwen2.5-coder:7b")
    assert doc is not None, "Ollama extraction returned None"
    assert doc.document_metadata.order_number == "OC-2026-08-0361"
    assert "2026-08-14" in doc.document_metadata.issue_date
    assert len(doc.items) == 2
    assert "06:05" in doc.delivery_status.arrival_time
    assert "07:48" in doc.delivery_status.completion_time
    assert "INCIDENCIA" in doc.delivery_status.status
