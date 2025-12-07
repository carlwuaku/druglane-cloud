import { Component, ElementRef, EventEmitter, inject, input, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { HttpService } from '../../../core/services/http/http.service';
import { NotifyService } from '../../services/notify.service';
import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';
import { ImageModule } from 'primeng/image';
import { AssetType } from '../form-generator/form-generator.interface';


interface UploadEvent {
  originalEvent: Event;
  files: File[];
}



@Component({
  selector: 'app-file-uploader',
  imports: [MatButtonModule, MatIconModule, ImageModule],
  templateUrl: './file-uploader.component.html',
  styleUrl: './file-uploader.component.scss'
})
export class FileUploaderComponent implements OnChanges {
  private notifyService = inject(NotifyService);
  private httpService = inject(HttpService);
  uploadedFiles: any[] = [];
  @Input() maxFileSize: number = 5; // in MB
  @Input() uploadUrl: string = `${this.httpService.baseUrl}/portal/assets/new`;
  @Input() multiple: boolean = false;
  @Input() parameter: string = "uploadFile";
  @Input({
    required: true
  }) assetType!: string;
  @Input() showUploadButton: boolean = true;
  @Input() showCancelButton: boolean = true;
  @Input() existingImage: string | null = null;
  @Input() uploadButtonLabel: string = "Confirm";
  @Input() cancelButtonLabel: string = "Cancel";
  @Input() chooseButtonLabel: string = "Select File";
  @Input() accept: string = ""
  @Input() showPreview: boolean = true;
  @Input() previewHeight: string = "100";

  // @Output() onUploadCompleted: EventEmitter<string> = new EventEmitter<string>();
  @Input() required: boolean = false;
  uploadedImage: string | undefined = undefined;
  @Input() originalImage: string | undefined = undefined;
  @Input() selectedFiles: File[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef;
  previews: { file: File, preview: string }[] = [];
  @Output() onFilesSelected: EventEmitter<File[]> = new EventEmitter<File[]>();
  @Output() onBase64Generated: EventEmitter<{ file: File, base64: string }[]> = new EventEmitter<{ file: File, base64: string }[]>();
  constructor() {
    this.uploadUrl = this.uploadUrl + '/' + this.assetType;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.originalImage) {
      this.originalImage = this.existingImage?.slice()
    }

  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    Array.from(files).forEach(file => {
      if (file.size <= this.maxFileSize * 1024 * 1024) {
        this.selectedFiles.push(file);
      } else {
        this.notifyService.failNotification(`${file.name} exceeds the ${this.maxFileSize}MB limit. `);
      }
    });
    this.onFilesSelected.emit(this.selectedFiles);
    this.generatePreviews();
    this.generateBase64();
    this.fileInput.nativeElement.value = '';
  }

  generatePreviews(): void {
    this.previews = [];
    this.selectedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previews.push({ file, preview: e.target.result });
        };
        reader.readAsDataURL(file);
      } else {
        this.previews.push({ file, preview: this.getFileIcon(file.type) });
      }
    });
  }

  getFileIcon(fileType: string): string {
    // Add more file types and icons as needed
    switch (fileType) {
      case 'application/pdf':
        return 'assets/images/pdf.png';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'assets/images/docx.png';
      default:
        return 'assets/images/document.png';
    }
  }

  // public onUpload(event: { originalEvent: HttpResponse<{ filePath: string, fullPath:string }> }) {
  //   this.uploadedImage = event.originalEvent.body?.fullPath
  //   this.onUploadCompleted.emit(event.originalEvent.body?.fullPath)
  // }

  public remove(file: File) {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
    this.generatePreviews();
    this.generateBase64();
  }

  generateBase64(): void {
    const base64Results: { file: File, base64: string }[] = [];
    let processedCount = 0;

    if (this.selectedFiles.length === 0) {
      this.onBase64Generated.emit([]);
      return;
    }

    this.selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        base64Results.push({
          file,
          base64: e.target.result
        });
        processedCount++;

        // Emit when all files have been processed
        if (processedCount === this.selectedFiles.length) {
          this.onBase64Generated.emit(base64Results);
        }
      };
      reader.onerror = () => {
        this.notifyService.failNotification(`Error reading file ${file.name}`);
        processedCount++;

        // Still emit even if there's an error, to keep count accurate
        if (processedCount === this.selectedFiles.length) {
          this.onBase64Generated.emit(base64Results);
        }
      };
      reader.readAsDataURL(file);
    });
  }
}
