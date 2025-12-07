import { v4 as uuidv4 } from 'uuid';

export interface IFormGenerator {
  label: string;
  name: string;
  type: string;
  hint: string;
  options: { key: string, value: string }[];
  className?: string;
  subtitle?: string;
  value: any;
  required: boolean;
  api_url?: string;
  apiLabelProperty?: string;
  apiKeyProperty?: string;
  apiType?: "search" | "select" | "datalist";
  selection_mode?: "single" | "multiple";
  apiInitialValue?: string;
  apiModule?: string;
  onChange?: (...value: string[]) => void | undefined;
  minLength?: number;
  maxLength?: number;
  customValidation?: { fieldsMatch: string[] };
  disabled?: "" | "disabled";
  hidden?: "" | "hidden";
  showOnly?: boolean;
  key?: string;
  customTemplate?: string; //an ng-template to be used to render the field. it should update the value of the field when the template changes
  placeholder?: string;
  file_types?: string; //comma separated. e.g. "jpg,png" used when type is 'file'. specifies the allowed file types
  assetType?: AssetType | undefined;
  maxFileSize?: number;
  useBase64ForFiles?: boolean;
}

export class FormField implements IFormGenerator {
  key?: string = "";
  label: string = "";
  name: string = "";
  type: string = "";
  hint: string = "";
  options: { key: string, value: string }[] = [];
  className?: string;
  subtitle?: string;
  value: any;
  required: boolean = true;
  api_url?: string;
  apiLabelProperty?: string;
  apiKeyProperty?: string;
  apiType?: "search" | "select" | "datalist";
  apiInitialValue?: string;
  apiModule?: string;
  onChange?: (...value: string[]) => void | undefined;
  minLength?: number;
  maxLength?: number;
  customValidation?: { fieldsMatch: string[] };
  disabled?: "" | "disabled";
  hidden?: "" | "hidden";
  showOnly?: boolean;
  customTemplate?: string; //an ng-template to be used to render the field. it should update the value of the field when the template changes
  placeholder?: string;
  assetType?: AssetType | undefined;
  maxFileSize?: number;
  constructor(type: string) {
    this.type = type;
    this.key = uuidv4();
  }
}

export const defaultObject: IFormGenerator = {
  label: "",
  name: "",
  type: "",
  hint: "",
  options: [],
  value: "",
  required: true
}

export const monthsOptions = [
  { key: "January", value: "1" },
  { key: "February", value: "2" },
  { key: "March", value: "3" },
  { key: "April", value: "4" },
  { key: "May", value: "5" },
  { key: "June", value: "6" },
  { key: "July", value: "7" },
  { key: "August", value: "8" },
  { key: "September", value: "9" },
  { key: "October", value: "10" },
  { key: "November", value: "11" },
  { key: "December", value: "12" }
]

export const PractitionerCategories = [
  { key: "Medical", value: "Medical" },
  { key: "Dental", value: "Dental" },
  { key: "Physician Assistant", value: "Physician Assistant" },
]

export function isRow(value: IFormGenerator | IFormGenerator[]): value is IFormGenerator[] {
  return (value as IFormGenerator[]).length !== undefined;
}

export function isFormField(value: IFormGenerator | IFormGenerator[]): value is IFormGenerator {
  return (value as IFormGenerator).label !== undefined;
}

export function findFormField(fields: (IFormGenerator | IFormGenerator[])[], name: string): IFormGenerator | undefined {
  for (const field of fields) {
    if (isFormField(field) && field.name === name) {
      return field;
    }
    else if (isRow(field)) {
      const found = field.find(f => f.name === name);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

export type AssetType = 'practitioners_images' |
  'documents' |
  'applications' |
  'payments';
