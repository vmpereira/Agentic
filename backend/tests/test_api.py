import sys
import os
import io
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "ok"
    assert "service" in json_data


def test_extract_pdf_mock_fallback():
    dummy_pdf = io.BytesIO(b"%PDF-1.4 mock content for extraction testing")
    files = {"file": ("test_order.pdf", dummy_pdf, "application/pdf")}

    
    response = client.post("/api/extract", files=files)
    assert response.status_code == 200
    json_data = response.json()
    
    assert "document_metadata" in json_data
    assert "vendor" in json_data
    assert "client" in json_data
    assert "items" in json_data
    assert "financial_totals" in json_data
    assert "transport_logistics" in json_data
    assert "delivery_status" in json_data
    assert "authorizations" in json_data
    
    assert json_data["document_metadata"]["order_number"] == "OC-2026-08-0417"
    assert json_data["vendor"]["rtn"] == "08019995123456"
    assert json_data["client"]["store_code"] == "LC-T5-TGU"
    assert len(json_data["items"]) >= 1


def test_export_excel_api_endpoint(tmp_path, mock_dinat_invoice_dict):
    target_excel = str(tmp_path / "api_export_test.xlsx")
    payload = {
        "documents": [mock_dinat_invoice_dict],
        "excel_path": target_excel,
        "mode": "create"
    }

    response = client.post("/api/export/excel", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert json_data["rows_added"] == len(mock_dinat_invoice_dict["items"])
