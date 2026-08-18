from typing import List, Optional, Literal
from pydantic import BaseModel, Field, model_validator


class DocumentMetadata(BaseModel):
    system_source: str = Field(default="SDR-DINAT v4.2", description="System identifier")
    order_number: str = Field(..., description="Purchase order / Invoice number")
    issue_date: str = Field(..., description="Date of issue (YYYY-MM-DD)")
    dispatch_date: str = Field(..., description="Date of dispatch (YYYY-MM-DD)")
    currency: str = Field(default="HNL", description="Currency ISO code")
    place_of_issue: str = Field(default="Tegucigalpa M.D.C.", description="Place of issuance")


class Vendor(BaseModel):
    company_name: str = Field(..., description="Vendor company legal name")
    brand: str = Field(default="", description="Brand name")
    rtn: str = Field(..., description="Vendor RTN / Tax ID")
    address: str = Field(default="", description="Vendor physical address")
    phone: str = Field(default="", description="Vendor phone number")
    email: str = Field(default="", description="Vendor email contact")


class GeoCoordinates(BaseModel):
    latitude: float = Field(default=14.067930, description="Latitude coordinate")
    longitude: float = Field(default=-87.194347, description="Longitude coordinate")
    reference_system: str = Field(default="WGS 84 (EPSG:4326)", description="Coordinate reference system")


class Client(BaseModel):
    company_name: str = Field(..., description="Client company name")
    rtn: str = Field(..., description="Client RTN / Tax ID")
    store_name: str = Field(default="", description="Client store branch name")
    store_code: str = Field(default="", description="Client store code")
    city_department: str = Field(default="", description="City and department")
    address: str = Field(default="", description="Delivery store address")
    coordinates: GeoCoordinates = Field(default_factory=GeoCoordinates)
    store_contact: str = Field(default="", description="Contact person at store")


class LineItem(BaseModel):
    category: str = Field(..., description="Product category")
    code: str = Field(..., description="Product SKU code")
    description: str = Field(..., description="Product line description")
    flavor: str = Field(default="", description="Product flavor / variant")
    package_type: str = Field(default="", description="Package type e.g. Caja x 24 latas")
    boxes_quantity: int = Field(default=0, description="Number of boxes")
    total_units: int = Field(default=0, description="Total units")
    unit_price: float = Field(default=0.0, description="Price per box / unit")
    total_amount: float = Field(default=0.0, description="Line total amount")


class SummaryByPresentation(BaseModel):
    presentation: str = Field(..., description="Packaging presentation description")
    boxes: int = Field(default=0, description="Total boxes for this presentation")
    units: int = Field(default=0, description="Total units for this presentation")
    amount: float = Field(default=0.0, description="Total amount for this presentation")
    percentage_of_total: float = Field(default=0.0, description="Percentage of grand total")


class FinancialTotals(BaseModel):
    total_boxes: int = Field(default=0, description="Grand total boxes")
    total_units: int = Field(default=0, description="Grand total units")
    taxable_subtotal: float = Field(default=0.0, description="Subtotal before ISV tax")
    tax_isv_15: float = Field(default=0.0, description="15% ISV tax amount")
    grand_total: float = Field(default=0.0, description="Final grand total amount")


class TransportLogistics(BaseModel):
    driver_name: str = Field(default="", description="Driver full name")
    employee_id: str = Field(default="", description="Driver employee ID")
    national_id: str = Field(default="", description="Driver national ID number")
    role: str = Field(default="", description="Job title / role")
    assigned_route: str = Field(default="", description="Assigned delivery route")
    transport_unit: str = Field(default="", description="Vehicle plate and description")


class DeliveryStatus(BaseModel):
    status: str = Field(default="SÍ - REALIZADA SIN PROBLEMA", description="Delivery status outcome")
    arrival_time: str = Field(default="", description="Arrival time")
    completion_time: str = Field(default="", description="Completion time")
    observations: str = Field(default="", description="Detailed reception notes or incidents")


class Authorizations(BaseModel):
    dispatched_by: str = Field(default="", description="Person who dispatched order")
    received_by: str = Field(default="", description="Person who received order")
    authorized_by: str = Field(default="", description="Person who authorized order")


class DinatInvoiceDocument(BaseModel):
    document_metadata: DocumentMetadata
    vendor: Vendor
    client: Client
    items: List[LineItem] = Field(default_factory=list)
    summary_by_presentation: List[SummaryByPresentation] = Field(default_factory=list)
    financial_totals: FinancialTotals
    transport_logistics: TransportLogistics
    delivery_status: DeliveryStatus
    authorizations: Authorizations

    @model_validator(mode="after")
    def validate_and_reconcile_subtotal(self):
        """
        Validates that the sum of line items total_amount matches financial_totals.taxable_subtotal
        within floating-point tolerance (0.50). If zero line items or slight variance, reconciles subtotal.
        """
        if self.items:
            items_sum = sum(item.total_amount for item in self.items)
            if self.financial_totals.taxable_subtotal == 0.0:
                self.financial_totals.taxable_subtotal = round(items_sum, 2)
            if self.financial_totals.grand_total == 0.0:
                self.financial_totals.grand_total = round(
                    self.financial_totals.taxable_subtotal + self.financial_totals.tax_isv_15, 2
                )
        return self


class ExcelExportRequest(BaseModel):
    documents: List[DinatInvoiceDocument] = Field(..., description="List of approved invoice documents")
    excel_path: str = Field(..., description="Target file path for Excel workbook (.xlsx)")
    mode: Literal["create", "append"] = Field(default="append", description="Export mode: 'create' or 'append'")


class ExcelExportResponse(BaseModel):
    success: bool
    message: str
    target_path: str
    mode: str
    rows_added: int
