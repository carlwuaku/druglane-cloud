import { Component, Input } from '@angular/core';
import { isObject } from '../../utils/helper';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { InlineEditorComponent } from '../inline-editor/inline-editor.component';
@Component({
  selector: 'app-json-editor',
  imports: [MatExpansionModule, MatButtonModule, MatIconModule, InlineEditorComponent],
  templateUrl: './json-editor.component.html',
  styleUrl: './json-editor.component.scss'
})
export class JsonEditorComponent {
  isObject = isObject;
  @Input() jsonObject: { [key: string]: any } = {};

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }



  setPropertyValue(key: string, value: any) {
    this.jsonObject[key] = value;
  }

  setPropertyText(key: string, newKey: any) {
    this.jsonObject[newKey] = this.jsonObject[key];
    delete this.jsonObject[key]
  }

  addProperty(key: string): void {
    // Logic to add a new property to the JSON object
  }

  editValue(key: string): void {
    // Logic to edit the value of a property in the JSON object
  }
}
