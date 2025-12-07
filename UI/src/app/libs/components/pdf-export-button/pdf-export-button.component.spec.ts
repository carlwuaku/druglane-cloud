import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfExportButtonComponent } from './pdf-export-button.component';

describe('PdfExportButtonComponent', () => {
  let component: PdfExportButtonComponent;
  let fixture: ComponentFixture<PdfExportButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfExportButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfExportButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
