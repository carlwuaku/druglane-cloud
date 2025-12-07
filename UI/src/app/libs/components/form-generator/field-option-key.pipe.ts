import { Pipe, PipeTransform } from '@angular/core';
import { IFormGenerator } from './form-generator.interface';

@Pipe({
  name: 'fieldOptionKey'
})
export class FieldOptionKeyPipe implements PipeTransform {

  transform(field: IFormGenerator): string {
    //we want to return the label of the option that is selected instead of the value
    return field.options.find(o => o.value == field.value)?.key || 'No selected option';
  }

}
