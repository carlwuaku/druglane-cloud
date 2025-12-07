import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IFormGenerator } from '../form-generator/form-generator.interface';
import { FormGeneratorComponent } from '../form-generator/form-generator.component';

@Component({
  selector: 'app-dialog-form',
  imports: [FormGeneratorComponent, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './dialog-form.component.html',
  styleUrl: './dialog-form.component.scss'
})
export class DialogFormComponent {
  formType: "submit" | "filter" | "emit" = "submit";
  fields: IFormGenerator[] = [];
  title: string = "";
  url: string = "";
  id: string = "";
  extraData: { key: string; value: any; }[] = [];
  readonly dialogRef = inject(MatDialogRef<DialogFormComponent>);
  readonly data = inject<{ fields: IFormGenerator[], formType: "submit" | "filter" | "emit", title: string, url?: string, id?: string, extraData?: { key: string; value: any; }[] }>(MAT_DIALOG_DATA);

  constructor() {
    this.formType = this.data.formType;
    this.fields = this.data.fields;
    this.title = this.data.title;
    this.url = this.data.url || "";
    this.id = this.data.id || "";
    this.extraData = this.data.extraData || [];
  }


  formSubmitted(args: IFormGenerator[]): void {
    this.dialogRef.close(args);
  }
}
