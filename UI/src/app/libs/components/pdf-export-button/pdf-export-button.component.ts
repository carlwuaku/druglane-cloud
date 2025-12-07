import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PdfExportService, PdfExportOptions } from '../../services/pdf-export.service';
import { NotifyService } from '../../services/notify.service';

@Component({
  selector: 'app-pdf-export-button',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './pdf-export-button.component.html',
  styleUrl: './pdf-export-button.component.scss'
})
export class PdfExportButtonComponent {
  @Input() elementId!: string;
  @Input() filename: string = 'export.pdf';
  @Input() buttonText: string = 'Export to PDF';
  @Input() buttonColor: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() icon: string = 'picture_as_pdf';
  @Input() orientation: 'portrait' | 'landscape' = 'portrait';
  @Input() format: 'a4' | 'letter' | 'legal' = 'a4';
  @Input() margin: number = 2;

  isExporting = false;

  private pdfExportService = inject(PdfExportService);
  private notify = inject(NotifyService);

  async exportToPdf(): Promise<void> {
    if (!this.elementId) {
      this.notify.failNotification('Element ID is required for PDF export');
      return;
    }

    if (this.isExporting) {
      return;
    }

    this.isExporting = true;

    try {
      const options: PdfExportOptions = {
        filename: this.filename,
        orientation: this.orientation,
        format: this.format,
        margin: this.margin
      };

      await this.pdfExportService.exportElementToPdf(this.elementId, options);
      this.notify.successNotification('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      this.notify.failNotification('Failed to export PDF. Please try again.');
    } finally {
      this.isExporting = false;
    }
  }
}
