import { IFormGenerator } from "../components/form-generator/form-generator.interface";
import { DataActionsButton } from "./DataAction.type";

export type ApiResponseObject<T> = {
  data: T;
  displayColumns: string[];
  total: number;
  columnFilters: IFormGenerator[];
  columnLabels: any,
}


export type DataListType<T> = T & {
  actions: DataActionsButton[];
}
