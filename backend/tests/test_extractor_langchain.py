import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from extractor import extract_invoice_data_from_bytes, parse_pdf_text
from schemas import DinatInvoiceDocument


def test_pdf_text_extraction_real_file():
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../Orden_Compra_DINAT_Naturas_LaColonia_T5_2026-08-17.pdf"))
    if not os.path.exists(pdf_path):
        pytest.skip(f"Sample PDF file not found at {pdf_path}")

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    text = parse_pdf_text(pdf_bytes)
    assert "DINAT HONDURAS" in text
    assert "OC-2026-08-0417" in text
    assert "NAT-LT-MZ" in text
    assert "NAT-1L-PN" in text


def test_langchain_pdf_extraction_real_file():
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../Orden_Compra_DINAT_Naturas_LaColonia_T5_2026-08-17.pdf"))
    if not os.path.exists(pdf_path):
        pytest.skip(f"Sample PDF file not found at {pdf_path}")

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    doc: DinatInvoiceDocument = extract_invoice_data_from_bytes(pdf_bytes, "Orden_Compra_DINAT_Naturas_LaColonia_T5_2026-08-17.pdf")
    
    # 1. Check Sheet 1: DATOS-CLIENTES (11 columns)
    assert doc.document_metadata.order_number == "OC-2026-08-0417"
    assert doc.document_metadata.issue_date == "2026-08-17"
    assert "Supermercados La Colonia" in doc.client.company_name
    assert doc.client.rtn == "08019008123459"
    assert doc.client.store_name == "T5 - La Kennedy"
    assert doc.client.store_code == "LC-T5-TGU"
    assert "Tegucigalpa" in doc.client.city_department
    assert "Colonia Kennedy" in doc.client.address
    assert doc.client.coordinates.latitude == 14.06793
    assert doc.client.coordinates.longitude == -87.194347
    assert "Marleny Zelaya" in doc.client.store_contact

    # 2. Check Sheet 2: PRODUCTO (9 columns across 12 line items)
    assert len(doc.items) == 12, f"Expected 12 line items, but got {len(doc.items)}"
    
    product_codes = [item.code for item in doc.items]
    expected_codes = [
        "NAT-LT-MZ", "NAT-LT-PR", "NAT-LT-ML", "NAT-LT-PN",
        "NAT-TP2-MZ", "NAT-TP2-PR", "NAT-TP2-ML", "NAT-TP2-PN",
        "NAT-1L-MZ", "NAT-1L-PR", "NAT-1L-ML", "NAT-1L-PN"
    ]
    for code in expected_codes:
        assert code in product_codes, f"Product code {code} missing from extracted items"

    first_item = doc.items[0]
    assert first_item.code == "NAT-LT-MZ"
    assert "Jugo NATURAS" in first_item.description
    assert first_item.flavor == "Manzana"
    assert "24" in first_item.package_type
    assert first_item.boxes_quantity == 40
    assert first_item.total_units == 960
    assert first_item.unit_price == 348.0
    assert first_item.total_amount == 13920.0

    # 3. Check Financial Totals
    assert doc.financial_totals.total_boxes == 419
    assert doc.financial_totals.taxable_subtotal == 123267.75
    assert doc.financial_totals.tax_isv_15 == 18490.16
    assert doc.financial_totals.grand_total == 141757.91

    # 4. Check Sheet 3: ENTREGA (11 columns)
    assert "José Fernando Andino Cruz" in doc.transport_logistics.driver_name
    assert doc.transport_logistics.national_id == "0801-1992-04517"
    assert "R-05" in doc.transport_logistics.assigned_route
    assert doc.transport_logistics.employee_id == "DNT-1428"
    assert "Conductor" in doc.transport_logistics.role
    assert "PBK-7412" in doc.transport_logistics.transport_unit
    assert doc.delivery_status.status == "SÍ - REALIZADA SIN PROBLEMA"
    assert doc.delivery_status.arrival_time == "07:42 a.m."
    assert doc.delivery_status.completion_time == "08:26 a.m."
    assert "Entrega realizada sin novedad" in doc.delivery_status.observations
    assert "Lic. Marleny Zelaya" in doc.authorizations.received_by

