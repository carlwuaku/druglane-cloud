
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-string-array-input',
  imports: [],
  templateUrl: './string-array-input.component.html',
  styleUrl: './string-array-input.component.scss'
})
export class StringArrayInputComponent {

  inputControl = new FormControl();

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  @Input() items: string[] | null = [];
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() name: string = '';
  @Output() valueChanged: EventEmitter<string[]> = new EventEmitter();

  constructor() {

  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (!this.items) {
      this.items = [];
    }
    // Add our item
    if (value) {
      this.items.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.valueChanged.emit(this.items)
  }

  remove(item: string): void {
    if (!this.items) {
      this.items = [];
    }
    const index = this.items.indexOf(item);

    if (index >= 0) {
      this.items.splice(index, 1);
    }

    this.valueChanged.emit(this.items)
  }

  edit(item: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove item if it no longer has a name
    if (!value) {
      this.remove(item);
      return;
    }
    if (!this.items) {
      this.items = [];
    }

    // Edit existing item
    const index = this.items.indexOf(item);
    if (index >= 0) {
      this.items[index] = value;
    }

    this.valueChanged.emit(this.items)
  }

}
