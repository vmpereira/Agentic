import os
import logging
from typing import List
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from schemas import DinatInvoiceDocument

logger = logging.getLogger("backend.exporter")

EXCEL_COLUMNS = [
    "Número de Orden",
    "Fecha Emisión",
    "Proveedor",
    "RTN Proveedor",
    "Cliente",
    "Código Tienda",
    "Código Producto",
    "Categoría",
    "Descripción Producto",
    "Sabor / Variante",
    "Presentación / Empaque",
    "Cantidad Cajas",
    "Total Unidades",
    "Precio Unitario (L)",
    "Monto Línea (L)",
    "Subtotal Gravable (L)",
    "ISV 15% (L)",
    "Gran Total (L)",
    "Conductor / Repartidor",
    "Unidad / Placa",
    "Estado Entrega",
    "Despachado Por",
    "Recibido Por",
    "Autorizado Por"
]


def resolve_safe_excel_path(file_path: str) -> str:
    """
    Validates target path permissions. If target path is root C:\\ or a non-writable/restricted path,
    resolves a safe, writable local user path.
    """
    clean_path = os.path.abspath(file_path)
    parent_dir = os.path.dirname(clean_path)
    
    if parent_dir == os.path.abspath(os.sep) or not os.path.exists(parent_dir):
        try:
            os.makedirs(parent_dir, exist_ok=True)
        except (PermissionError, OSError):
            fallback_dir = os.path.abspath(os.path.join(os.getcwd(), "exports"))
            os.makedirs(fallback_dir, exist_ok=True)
            filename = os.path.basename(file_path)
            clean_path = os.path.join(fallback_dir, filename if filename else "Registros_Facturas_2026.xlsx")
            logger.warning(f"Target path '{file_path}' permission restricted. Saving safely to fallback path '{clean_path}'")

    return clean_path


def get_last_populated_row(ws) -> int:
    """
    Scans from current ws.max_row downwards to find the exact last row that has non-empty values,
    preventing openpyxl from overwriting existing rows or skipping due to empty styled cells.
    """
    for r in range(ws.max_row, 0, -1):
        if any(ws.cell(row=r, column=c).value is not None for c in range(1, len(EXCEL_COLUMNS) + 1)):
            return r
    return 0


def generate_or_append_excel(documents: List[DinatInvoiceDocument], file_path: str, mode: str = "append") -> dict:
    """
    Creates a new Excel workbook or appends invoice line items to the very end of an existing workbook sheet.
    Guarantees that existing rows are never overwritten in append mode.
    """
    target_file = resolve_safe_excel_path(file_path)

    try:
        # Check if file exists and mode is append
        file_exists = os.path.exists(target_file)
        
        if mode == "create" or not file_exists:
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = "Facturas"
            
            # Write header row
            ws.append(EXCEL_COLUMNS)
            header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
            header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
            center_align = Alignment(horizontal="center", vertical="center", wrap_text=True)

            for col_idx in range(1, len(EXCEL_COLUMNS) + 1):
                cell = ws.cell(row=1, column=col_idx)
                cell.fill = header_fill
                cell.font = header_font
                cell.alignment = center_align
            
            next_row = 2
        else:
            wb = openpyxl.load_workbook(target_file)
            if "Facturas" in wb.sheetnames:
                ws = wb["Facturas"]
            else:
                ws = wb.active
            
            # Calculate next row immediately following last populated row
            last_row = get_last_populated_row(ws)
            next_row = last_row + 1 if last_row > 0 else 2

        rows_added = 0
        data_font = Font(name="Calibri", size=10)
        left_align = Alignment(horizontal="left", vertical="center")
        right_align = Alignment(horizontal="right", vertical="center")
        thin_border = Border(
            left=Side(style='thin', color='E2E8F0'),
            right=Side(style='thin', color='E2E8F0'),
            top=Side(style='thin', color='E2E8F0'),
            bottom=Side(style='thin', color='E2E8F0')
        )

        for doc in documents:
            items = doc.items if doc.items else [None]
            for item in items:
                row_data = [
                    doc.document_metadata.order_number,
                    doc.document_metadata.issue_date,
                    doc.vendor.company_name,
                    doc.vendor.rtn,
                    doc.client.company_name,
                    doc.client.store_code,
                    item.code if item else "N/A",
                    item.category if item else "N/A",
                    item.description if item else "N/A",
                    item.flavor if item else "",
                    item.package_type if item else "",
                    item.boxes_quantity if item else 0,
                    item.total_units if item else 0,
                    item.unit_price if item else 0.0,
                    item.total_amount if item else 0.0,
                    doc.financial_totals.taxable_subtotal,
                    doc.financial_totals.tax_isv_15,
                    doc.financial_totals.grand_total,
                    doc.transport_logistics.driver_name,
                    doc.transport_logistics.transport_unit,
                    doc.delivery_status.status,
                    doc.authorizations.dispatched_by,
                    doc.authorizations.received_by,
                    doc.authorizations.authorized_by,
                ]

                # Explicitly set values at next_row to guarantee sequential appending
                for col_idx, val in enumerate(row_data, start=1):
                    cell = ws.cell(row=next_row, column=col_idx, value=val)
                    cell.font = data_font
                    cell.border = thin_border
                    
                    if col_idx in [12, 13]:
                        cell.alignment = right_align
                        cell.number_format = '#,##0'
                    elif col_idx in [14, 15, 16, 17, 18]:
                        cell.alignment = right_align
                        cell.number_format = '"L" #,##0.00'
                    else:
                        cell.alignment = left_align

                next_row += 1
                rows_added += 1

        # Auto-adjust column widths
        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 3, 14)

        try:
            wb.save(target_file)
        except PermissionError:
            fallback_file = os.path.abspath(os.path.join(os.getcwd(), "exports", f"Registros_{os.path.basename(target_file)}"))
            os.makedirs(os.path.dirname(fallback_file), exist_ok=True)
            wb.save(fallback_file)
            target_file = fallback_file
            logger.warning(f"File locked or write permission denied for '{file_path}'. Saved to '{fallback_file}'")

        return {
            "success": True,
            "message": f"Successfully exported {rows_added} row(s) to Excel.",
            "target_path": os.path.abspath(target_file),
            "mode": mode,
            "rows_added": rows_added
        }

    except Exception as e:
        logger.error(f"Error generating Excel file: {e}", exc_info=True)
        raise PermissionError(f"Permission restricted for file path '{file_path}'. Details: {e}")
