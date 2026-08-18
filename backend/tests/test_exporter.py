import os
import openpyxl
import pytest
from exporter import generate_or_append_excel, resolve_safe_excel_path, get_last_populated_row


def test_create_new_excel(tmp_path, mock_dinat_invoice_doc):
    excel_file = tmp_path / "test_registros_create.xlsx"
    file_path = str(excel_file)

    res = generate_or_append_excel([mock_dinat_invoice_doc], file_path, mode="create")
    assert res["success"] is True
    assert res["rows_added"] == len(mock_dinat_invoice_doc.items)
    assert os.path.exists(res["target_path"])

    # Verify OpenPyXL file content
    wb = openpyxl.load_workbook(res["target_path"])
    assert "Facturas" in wb.sheetnames
    sheet = wb["Facturas"]
    assert sheet.max_row == 1 + len(mock_dinat_invoice_doc.items)  # 1 header + N items

    # Check header values
    header_row = [cell.value for cell in sheet[1]]
    assert "Número de Orden" in header_row
    assert "RTN Proveedor" in header_row
    assert "Código Producto" in header_row

    # Check first data row values
    row2 = [cell.value for cell in sheet[2]]
    assert row2[0] == "OC-2026-08-0417"  # Order number
    assert row2[2] == "DINAT HONDURAS, S. A. DE C. V."  # Vendor


def test_append_existing_excel_sequential_lines(tmp_path, mock_dinat_invoice_doc):
    excel_file = tmp_path / "test_registros_append_sequential.xlsx"
    file_path = str(excel_file)
    items_count = len(mock_dinat_invoice_doc.items)

    # 1. Create file first with Document 1 (Order OC-2026-08-0417)
    res1 = generate_or_append_excel([mock_dinat_invoice_doc], file_path, mode="create")
    target_path = res1["target_path"]
    
    wb1 = openpyxl.load_workbook(target_path)
    sheet1 = wb1["Facturas"]
    assert sheet1.max_row == 1 + items_count
    assert sheet1.cell(row=2, column=1).value == "OC-2026-08-0417"

    # 2. Prepare Document 2 with a different order number (Order OC-2026-09-9999)
    doc2 = mock_dinat_invoice_doc.model_copy(deep=True)
    doc2.document_metadata.order_number = "OC-2026-09-9999"

    # 3. Append Document 2 to existing file with mode="append"
    res2 = generate_or_append_excel([doc2], target_path, mode="append")
    assert res2["success"] is True
    assert res2["rows_added"] == items_count

    # 4. Read back file and verify that Doc 1 rows are preserved intact
    # and Doc 2 rows are sequentially appended at the end
    wb2 = openpyxl.load_workbook(target_path)
    sheet2 = wb2["Facturas"]
    expected_total_rows = 1 + (items_count * 2)
    
    assert get_last_populated_row(sheet2) == expected_total_rows
    assert sheet2.cell(row=2, column=1).value == "OC-2026-08-0417"  # Preserved Doc 1
    assert sheet2.cell(row=1 + items_count, column=1).value == "OC-2026-08-0417" # Preserved Doc 1 end
    assert sheet2.cell(row=2 + items_count, column=1).value == "OC-2026-09-9999" # Appended Doc 2 start!
    assert sheet2.cell(row=expected_total_rows, column=1).value == "OC-2026-09-9999" # Appended Doc 2 end!


def test_mode_create_overwrites_existing_excel(tmp_path, mock_dinat_invoice_doc):
    excel_file = tmp_path / "test_registros_overwrite.xlsx"
    file_path = str(excel_file)
    items_count = len(mock_dinat_invoice_doc.items)

    # 1. Create file first with Document 1
    generate_or_append_excel([mock_dinat_invoice_doc], file_path, mode="create")

    # 2. Execute mode="create" on same file with Document 2
    doc2 = mock_dinat_invoice_doc.model_copy(deep=True)
    doc2.document_metadata.order_number = "OC-2026-NEW"

    res = generate_or_append_excel([doc2], file_path, mode="create")
    assert res["success"] is True

    wb = openpyxl.load_workbook(file_path)
    sheet = wb["Facturas"]
    assert sheet.max_row == 1 + items_count  # Overwritten cleanly back to 1 header + items_count
    assert sheet.cell(row=2, column=1).value == "OC-2026-NEW"


def test_resolve_safe_excel_path_permission_fallback():
    restricted_path = r"C:\Users\usuario\non_existent_folder\test.xlsx"
    safe_path = resolve_safe_excel_path(restricted_path)

    assert safe_path != ""
    assert "exports" in safe_path or os.path.exists(os.path.dirname(safe_path))


def test_generate_or_append_excel_with_restricted_path(mock_dinat_invoice_doc):
    restricted_path = r"C:\Users\usuario\Registros_Factura_2026.xlsx"
    res = generate_or_append_excel([mock_dinat_invoice_doc], restricted_path, mode="create")

    assert res["success"] is True
    assert res["rows_added"] == len(mock_dinat_invoice_doc.items)
    assert os.path.exists(res["target_path"])
