import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface PdfExportOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter' | 'legal';
  margin?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  /**
   * Exports an HTML element to PDF maintaining native text and elements
   * @param elementId The ID of the HTML element to export
   * @param options PDF generation options
   * @returns Promise that resolves when PDF is generated
   */
  async exportElementToPdf(
    elementId: string,
    options: PdfExportOptions = {}
  ): Promise<void> {
    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Default options
    const filename = options.filename || 'export.pdf';
    const orientation = options.orientation || 'portrait';
    const format = options.format || 'a4';
    const margin = options.margin || 10;

    // Create PDF document with A4 size and portrait orientation
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format
    });

    try {
      // Calculate the page width in mm
      const pageWidth = orientation === 'portrait' ? 210 : 297;
      const contentWidth = pageWidth - (margin * 2);

      // Use jsPDF's html method to convert the element to PDF
      // This maintains text as selectable text rather than images
      await pdf.html(element, {
        callback: (doc) => {
          doc.save(filename);
        },
        x: margin,
        y: margin,
        width: contentWidth, // Available width for content
        windowWidth: 800, // Fixed window width for consistent rendering
        autoPaging: 'text', // Enable automatic page breaks
        html2canvas: {
          scale: 0.264583, // Scale to match A4 dimensions (210mm / 794px ≈ 0.264)
          useCORS: true, // Enable CORS for images
          letterRendering: true,
          logging: false
        }
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Exports an HTML element to PDF and returns the blob instead of downloading
   * @param elementId The ID of the HTML element to export
   * @param options PDF generation options
   * @returns Promise that resolves with the PDF blob
   */
  async exportElementToPdfBlob(
    elementId: string,
    options: PdfExportOptions = {}
  ): Promise<Blob> {
    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    const orientation = options.orientation || 'portrait';
    const format = options.format || 'a4';
    const margin = options.margin || 10;

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format
    });

    return new Promise((resolve, reject) => {
      // Calculate the page width in mm
      const pageWidth = orientation === 'portrait' ? 210 : 297;
      const contentWidth = pageWidth - (margin * 2);

      pdf.html(element, {
        callback: (doc) => {
          const blob = doc.output('blob');
          resolve(blob);
        },
        x: margin,
        y: margin,
        width: contentWidth,
        windowWidth: 800,
        autoPaging: 'text',
        html2canvas: {
          scale: 0.264583,
          useCORS: true,
          letterRendering: true,
          logging: false
        }
      }).catch(reject);
    });
  }
}
