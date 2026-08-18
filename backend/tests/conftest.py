import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from schemas import (
    DinatInvoiceDocument,
    DocumentMetadata,
    Vendor,
    Client,
    GeoCoordinates,
    LineItem,
    SummaryByPresentation,
    FinancialTotals,
    TransportLogistics,
    DeliveryStatus,
    Authorizations,
)



@pytest.fixture
def mock_dinat_invoice_dict():
    return {
        "document_metadata": {
            "system_source": "SDR-DINAT v4.2",
            "order_number": "OC-2026-08-0417",
            "issue_date": "2026-08-17",
            "dispatch_date": "2026-08-17",
            "currency": "HNL",
            "place_of_issue": "Tegucigalpa M.D.C.",
        },
        "vendor": {
            "company_name": "DINAT HONDURAS, S. A. DE C. V.",
            "brand": "NATURAS",
            "rtn": "08019995123456",
            "address": "Boulevard Centroamérica, Edificio Corporativo DINAT, Tegucigalpa M.D.C.",
            "phone": "(504) 2232-8800",
            "email": "ventas@dinathonduras.hn",
        },
        "client": {
            "company_name": "Supermercados La Colonia, S. A. de C. V.",
            "rtn": "08019008123459",
            "store_name": "T5 - La Kennedy",
            "store_code": "LC-T5-TGU",
            "city_department": "Tegucigalpa, Francisco Morazán, Honduras",
            "address": "Colonia Kennedy, Bloque 7, Avenida Principal",
            "coordinates": {
                "latitude": 14.067930,
                "longitude": -87.194347,
                "reference_system": "WGS 84 (EPSG:4326)",
            },
            "store_contact": "Lic. Marleny Zelaya - Jefa de Recibo",
        },
        "items": [
            {
                "category": "JUGO NATURAS EN LATA 335 ML",
                "code": "NAT-LT-MZ",
                "description": "Jugo NATURAS en lata 335 ml - Manzana",
                "flavor": "Manzana",
                "package_type": "Caja x 24 latas",
                "boxes_quantity": 40,
                "total_units": 960,
                "unit_price": 348.00,
                "total_amount": 13920.00,
            },
            {
                "category": "JUGO NATURAS EN LATA 335 ML",
                "code": "NAT-LT-DR",
                "description": "Jugo NATURAS en lata 335 ml - Durazno",
                "flavor": "Durazno",
                "package_type": "Caja x 24 latas",
                "boxes_quantity": 90,
                "total_units": 2160,
                "unit_price": 348.00,
                "total_amount": 31320.00,
            },
        ],
        "summary_by_presentation": [
            {
                "presentation": "Jugo NATURAS en lata 335 ml",
                "boxes": 130,
                "units": 3120,
                "amount": 45240.00,
                "percentage_of_total": 36.7,
            }
        ],
        "financial_totals": {
            "total_boxes": 419,
            "total_units": 9513,
            "taxable_subtotal": 45240.00,
            "tax_isv_15": 6786.00,
            "grand_total": 52026.00,
        },
        "transport_logistics": {
            "driver_name": "José Fernando Andino Cruz",
            "employee_id": "DNT-1428",
            "national_id": "0801-1992-04517",
            "role": "Conductor - Repartidor Ruta Sur",
            "assigned_route": "R-05 Tegucigalpa Centro-Sur",
            "transport_unit": "Camión refrigerado / Placa PBK-7412",
        },
        "delivery_status": {
            "status": "SÍ - REALIZADA SIN PROBLEMA",
            "arrival_time": "07:42 a.m.",
            "completion_time": "08:26 a.m.",
            "observations": "Entrega realizada sin novedad. Producto recibido completo.",
        },
        "authorizations": {
            "dispatched_by": "José Fernando Andino Cruz - Emp. DNT-1428",
            "received_by": "Lic. Marleny Zelaya - Jefa de Recibo",
            "authorized_by": "Ing. Karla Suyapa Muñoz - Emp. DNT-0912",
        },
    }


@pytest.fixture
def mock_dinat_invoice_doc(mock_dinat_invoice_dict):
    return DinatInvoiceDocument(**mock_dinat_invoice_dict)
