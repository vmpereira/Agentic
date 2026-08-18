import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Uploader } from '../components/Uploader';

describe('Uploader Component', () => {
  it('renders dropzone title and file input button', () => {
    const handleFileSelected = vi.fn();
    render(<Uploader onFileSelected={handleFileSelected} />);

    expect(screen.getByText(/1. Cargar PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/Arrastra y suelta un archivo PDF aquí/i)).toBeInTheDocument();
    expect(screen.getByText(/Seleccionar archivo/i)).toBeInTheDocument();
  });

  it('triggers onFileSelected callback when a valid PDF is dropped', () => {
    const handleFileSelected = vi.fn();
    render(<Uploader onFileSelected={handleFileSelected} />);

    const dropzone = screen.getByTestId('dropzone');
    const pdfFile = new File(['dummy content'], 'factura.pdf', { type: 'application/pdf' });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [pdfFile],
      },
    });

    expect(handleFileSelected).toHaveBeenCalledTimes(1);
    expect(handleFileSelected).toHaveBeenCalledWith(pdfFile);
  });
});
