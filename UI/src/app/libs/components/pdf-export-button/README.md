# PDF Export Button Component

A reusable Angular component that exports HTML elements to PDF format while maintaining native text and element rendering (not as images).

## Features

- Exports HTML content to PDF with native text rendering
- A4 portrait mode by default with customizable options
- Configurable margins, orientation, and page format
- Material Design button with loading state
- Automatic page breaks for long content

## Usage

### Basic Usage

```typescript
import { Component } from '@angular/core';
import { PdfExportButtonComponent } from './libs/components/pdf-export-button/pdf-export-button.component';

@Component({
  selector: 'app-my-page',
  imports: [PdfExportButtonComponent],
  template: `
    <div id="content-to-export">
      <h1>My Document</h1>
      <p>This content will be exported to PDF with native text rendering.</p>
    </div>

    <app-pdf-export-button
      elementId="content-to-export"
      filename="my-document.pdf">
    </app-pdf-export-button>
  `
})
export class MyPageComponent {}
```

### Advanced Usage with Custom Options

```typescript
<app-pdf-export-button
  elementId="invoice-details"
  filename="invoice-2024.pdf"
  buttonText="Download Invoice"
  buttonColor="accent"
  icon="download"
  orientation="portrait"
  format="a4"
  [margin]="15">
</app-pdf-export-button>
```

## Component Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `elementId` | `string` | **Required** | The ID of the HTML element to export |
| `filename` | `string` | `'export.pdf'` | The name of the downloaded PDF file |
| `buttonText` | `string` | `'Export to PDF'` | Text displayed on the button |
| `buttonColor` | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material button color |
| `icon` | `string` | `'picture_as_pdf'` | Material icon name |
| `orientation` | `'portrait' \| 'landscape'` | `'portrait'` | PDF page orientation |
| `format` | `'a4' \| 'letter' \| 'legal'` | `'a4'` | PDF page format |
| `margin` | `number` | `10` | PDF margins in millimeters |

## PDF Export Service

You can also use the `PdfExportService` directly in your components for more control:

```typescript
import { Component, inject } from '@angular/core';
import { PdfExportService } from './libs/services/pdf-export.service';

@Component({
  selector: 'app-custom',
  template: `...`
})
export class CustomComponent {
  private pdfService = inject(PdfExportService);

  async exportCustom() {
    await this.pdfService.exportElementToPdf('my-element-id', {
      filename: 'custom.pdf',
      orientation: 'landscape',
      format: 'letter',
      margin: 20
    });
  }

  async getPdfBlob() {
    const blob = await this.pdfService.exportElementToPdfBlob('my-element-id');
    // Do something with the blob (e.g., upload to server)
  }
}
```

## Tips for Best Results

1. **Styling**: Ensure your content has proper styling. Inline styles work best.
2. **Images**: Use CORS-enabled images or base64-encoded images for best results.
3. **Width**: Set a fixed width on the element to export for consistent results.
4. **Page Breaks**: Use CSS `page-break-before` or `page-break-after` to control pagination.

## Example with Styled Content

```html
<div id="report" style="padding: 20px; font-family: Arial, sans-serif;">
  <h1 style="color: #333; border-bottom: 2px solid #007bff;">Annual Report</h1>

  <section style="margin-top: 20px;">
    <h2>Summary</h2>
    <p>This is a sample report with native text rendering...</p>
  </section>

  <div style="page-break-before: always;">
    <h2>Detailed Analysis</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px;">Item</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Value</th>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">Revenue</td>
        <td style="border: 1px solid #ddd; padding: 8px;">$100,000</td>
      </tr>
    </table>
  </div>
</div>

<app-pdf-export-button
  elementId="report"
  filename="annual-report-2024.pdf"
  buttonText="Download Report">
</app-pdf-export-button>
```
