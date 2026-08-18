# PDF Data Extractor Desktop App

An enterprise-grade desktop application for extracting structured data from PDF purchase orders and invoices using Multimodal LLMs (LangChain + Gemini / OpenAI / Smart Mock Fallback), reviewing & editing extracted data in a Human-in-the-Loop workspace, and generating or appending rows to Excel files (`.xlsx`).

---

## 🏗️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, LangChain, Pydantic V2, OpenPyXL
- **Frontend**: Next.js 14, React 18, Tailwind CSS, Lucide Icons
- **Desktop Container**: Electron (or standard local browser execution)
- **Testing**: Pytest (Backend API & Exporter)

---

## 📋 Prerequisites

Before running the application, make sure you have the following installed on your local machine:

1. **Python 3.10+** (Verify with `python --version`)
2. **Node.js 18+ or 20+** (Verify with `node --version`)
3. **Git**

---

## 🚀 How to Run the App (Local Environment)

To run the full stack locally, open **two separate terminal windows** (or three if launching Electron).

### Terminal 1: FastAPI Python Backend

```bash
# 1. Navigate to the backend directory
cd c:\dev\agentic\backend

# 2. Create a virtual environment (optional but recommended)
python -m venv venv

# 3. Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# (On Linux / macOS use: source venv/bin/activate)

# 4. Install backend dependencies
pip install -r requirements.txt

# 5. Start the FastAPI backend server
python main.py
```

> **API Server URL**: `http://localhost:8000`  
> **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

### Terminal 2: Next.js / React Frontend

```bash
# 1. Navigate to the frontend directory
cd c:\dev\agentic\frontend

# 2. Install frontend dependencies
npm install

# 3. Start the Next.js development server
npm run dev
```

> **Web Application URL**: `http://localhost:3000`

---

### Terminal 3 (Optional): Launch Electron Container

> ❓ **Is Terminal 2 required for Terminal 3?**  
> **During Development (`npm run dev`)**: **YES.** Electron loads the live React UI from Next.js dev server on `http://localhost:3000` (Terminal 2).  
> **In Production Build**: **NO.** Once you build Next.js (`npm run build` static export), Electron can serve the exported HTML files directly without Terminal 2.

```bash
# Navigate to the project root directory
cd c:\dev\agentic

# Launch Electron desktop wrapper (requires Terminal 1 and Terminal 2 running in dev mode)
npx electron electron/main.js
```


---

## 🔑 Environment Variables (Optional LLM Keys)

The app includes a **Smart LLM Extractor (Mock Provider)** fallback so it works immediately out-of-the-box for local testing without requiring an API key.

If you want live Multimodal LLM extraction using Google Gemini or OpenAI:

1. Create a `.env` file inside the `backend/` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   # OR
   OPENAI_API_KEY=your_openai_api_key_here
   ```
2. Restart the FastAPI backend server (`python main.py`).

---

## 🧪 Running Automated Tests

### 1. Run Backend Pytest Suite
```bash
cd c:\dev\agentic
python -m pytest backend/tests/ -v
```

### 2. Run Frontend Next.js Production Build Validation
```bash
cd c:\dev\agentic\frontend
npm run build
```

---

## 📖 Application User Guide

1. **Step 1: Upload PDF (`1. Cargar PDF`)**:
   - Drag & drop a purchase order or invoice PDF into the blue dropzone, or click **Seleccionar archivo**.
   - The system validates the PDF structure and invokes the Multimodal LLM pipeline.

2. **Step 2: Human-in-the-Loop Review (`3. Revisar y editar datos`)**:
   - Inspect the extracted data across the 6 collapsible document sections:
     - **Encabezado y Datos del Proveedor** (Order #, Issue Date, Vendor RTN, Brand)
     - **Datos del Cliente y Geolocalización** (Client Name, Store Code, Lat/Long coordinates)
     - **Detalle de Productos** (Editable line items table with automatic line total recalculations)
     - **Resumen y Totales Financieros** (Taxable Subtotal, 15% ISV tax, Grand Total)
     - **Transporte y Logística** (Driver Name, Employee ID, Vehicle Plate)
     - **Firmas y Autorizaciones** (Dispatched by, Received by, Authorized by)
   - Click **Ver JSON** to view or copy the raw JSON schema.
   - Click **Validar datos** when review is complete.

3. **Step 3: Ready for Production (`2. Listo para producción`)**:
   - Review the summary of the validated document.
   - Set the destination Excel file path (`.xlsx`).
   - Select the production action:
     - **Append (agregar al final)**: Appends new data rows to an existing Excel workbook sheet.
     - **Crear nuevo archivo**: Creates a brand new formatted Excel file.
   - Click **Confirmar y generar Excel** to save.
