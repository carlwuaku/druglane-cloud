import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface ProgressItem {
  title: string;
  progress: number;
}

@Component({
  selector: 'app-progress-dialog',
  imports: [MatDialogModule, MatProgressBarModule, MatButtonModule
  ],
  templateUrl: './progress-dialog.component.html',
  styleUrl: './progress-dialog.component.scss'
})
export class ProgressDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ProgressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      progressItems: ProgressItem[];
      disableCancel?: boolean;
    }
  ) { }

  onCancel(): void {
    this.dialogRef.close();
  }
}
