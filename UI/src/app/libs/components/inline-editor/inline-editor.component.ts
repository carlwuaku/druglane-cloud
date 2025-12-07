
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inline-editor',
  imports: [FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './inline-editor.component.html',
  styleUrl: './inline-editor.component.scss'
})
export class InlineEditorComponent {
  @Input() text: any;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter();

  editMode: boolean = false;
  newText: string = "";

  startEdit() {
    this.newText = this.text;
    this.editMode = true;
  }

  cancel() {
    this.editMode = false;
  }

  save() {
    this.text = this.newText;
    this.editMode = false;
    this.valueChanged.emit(this.newText)
  }
}
