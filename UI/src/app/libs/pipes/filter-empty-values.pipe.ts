import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterEmptyValues'
})
export class FilterEmptyValuesPipe implements PipeTransform {

  transform(items: any[], valueField: string): any[] {
    if (items && items.length > 0 && valueField) {
      return items.filter(item => item[valueField]);
    }
    return items;
  }

}
