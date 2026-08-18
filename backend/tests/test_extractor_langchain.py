import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from extractor import extract_invoice_data_from_bytes, parse_pdf_text
from schemas import DinatInvoiceDocument


def test_pdf_text_extraction_real_file():
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../Orden_Compra_DINAT_Naturas_LaColonia_T5_2026-08-17.pdf"))
    assert os.path.exists(pdf_path), f"PDF file not found at {pdf_path}"

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    text = parse_pdf_text(pdf_bytes)
    assert "DINAT HONDURAS" in text
    assert "OC-2026-08-0417" in text
    assert "NAT-LT-MZ" in text
    assert "NAT-1L-PN" in text


def test_langchain_pdf_extraction_real_file():
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../Orden_Compra_DINAT_Naturas_LaColonia_T5_2026-08-17.pdf"))
    assert os.path.exists(pdf_path)

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    doc: DinatInvoiceDocument = extract_invoice_data_from_bytes(pdf_bytes, "Orden_Compra_DINAT_Naturas_LaColonia_T5_2026-08-17.pdf")
    
    # 1. Check Document Metadata
    assert doc.document_metadata.order_number == "OC-2026-08-0417"
    assert doc.document_metadata.issue_date == "2026-08-17"
    assert doc.document_metadata.currency == "HNL"

    # 2. Check Vendor & Client
    assert "DINAT HONDURAS" in doc.vendor.company_name
    assert doc.vendor.rtn == "08019995123456"
    assert "Supermercados La Colonia" in doc.client.company_name
    assert doc.client.store_code == "LC-T5-TGU"

    # 3. Check All 12 Line Items
    assert len(doc.items) == 12, f"Expected 12 line items, but got {len(doc.items)}"
    
    product_codes = [item.code for item in doc.items]
    expected_codes = [
        "NAT-LT-MZ", "NAT-LT-PR", "NAT-LT-ML", "NAT-LT-PN",
        "NAT-TP2-MZ", "NAT-TP2-PR", "NAT-TP2-ML", "NAT-TP2-PN",
        "NAT-1L-MZ", "NAT-1L-PR", "NAT-1L-ML", "NAT-1L-PN"
    ]
    for code in expected_codes:
        assert code in product_codes, f"Product code {code} missing from extracted items"

    # 4. Check Financial Totals
    assert doc.financial_totals.total_boxes == 419
    assert doc.financial_totals.taxable_subtotal == 123267.75
    assert doc.financial_totals.tax_isv_15 == 18490.16
    assert doc.financial_totals.grand_total == 141757.91

    # 5. Check Logistics & Authorizations
    assert "José Fernando Andino Cruz" in doc.transport_logistics.driver_name
    assert doc.transport_logistics.employee_id == "DNT-1428"
    assert "Lic. Marleny Zelaya" in doc.authorizations.received_by
