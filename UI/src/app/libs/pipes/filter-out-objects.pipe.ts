import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterOutObjects'
})
export class FilterOutObjectsPipe implements PipeTransform {



  transform(items: any[], searchText: string, properties?: string[]): any[] {
    // Return original array if no search text or items
    if (!items || !searchText || searchText.trim() === '') {
      return items;
    }

    // Normalize search text
    searchText = searchText.toLowerCase().trim();

    return items.filter(item => {
      // If item is a primitive (string, number)
      if (typeof item !== 'object' || item === null) {
        return String(item).toLowerCase().includes(searchText);
      }

      // If no specific properties provided, search all properties
      if (!properties || properties.length === 0) {
        return this.searchAllProperties(item, searchText);
      }

      // Search only specified properties
      return properties.some(prop => {
        const value = this.getNestedProperty(item, prop);
        if (value === null || value === undefined) {
          return false;
        }
        return !String(value).toLowerCase().includes(searchText);
      });
    });
  }

  /**
   * Search all properties of an object recursively
   */
  private searchAllProperties(obj: any, searchText: string): boolean {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        // Skip null or undefined values
        if (value === null || value === undefined) {
          continue;
        }

        // For nested objects, recurse
        if (typeof value === 'object' && !Array.isArray(value)) {
          if (this.searchAllProperties(value, searchText)) {
            return true;
          }
        }
        // For arrays, check each element
        else if (Array.isArray(value)) {
          if (value.some(item => {
            if (typeof item === 'object') {
              return this.searchAllProperties(item, searchText);
            }
            return String(item).toLowerCase().includes(searchText);
          })) {
            return true;
          }
        }
        // For primitive values
        else {
          if (String(value).toLowerCase().includes(searchText)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Get nested property value using dot notation
   * Example: 'user.address.city' will traverse the object
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => {
      return current ? current[prop] : undefined;
    }, obj);
  }

}
