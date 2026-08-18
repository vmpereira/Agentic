import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExportSuccessModal } from '../components/ExportSuccessModal';

describe('ExportSuccessModal Component', () => {
  it('renders file target path, rows added, and mode info when opened', () => {
    const handleClose = vi.fn();
    render(
      <ExportSuccessModal
        isOpen={true}
        onClose={handleClose}
        targetPath="C:\\Users\\usuario\\Documents\\Registros_Facturas_2024.xlsx"
        mode="append"
        rowsAdded={12}
        grandTotal={141757.91}
      />
    );

    expect(screen.getByText(/¡Archivo Excel Generado!/i)).toBeInTheDocument();
    expect(screen.getByText(/Registros_Facturas_2024.xlsx/i)).toBeInTheDocument();
    expect(screen.getByText(/12 productos/i)).toBeInTheDocument();
    expect(screen.getByText(/Append \(Anexar\)/i)).toBeInTheDocument();
  });

  it('triggers onClose when Entendido / Continuar is clicked', () => {
    const handleClose = vi.fn();
    render(
      <ExportSuccessModal
        isOpen={true}
        onClose={handleClose}
        targetPath="C:\\Export\\Facturas.xlsx"
        mode="create"
        rowsAdded={10}
        grandTotal={50000}
      />
    );

    const btnClose = screen.getByText(/Entendido \/ Continuar/i);
    fireEvent.click(btnClose);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
