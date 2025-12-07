import { Params } from "@angular/router";
import { DataActionsButton } from "./DataAction.type";
import { AlertType } from "../components/alert/alert.component";

export type MenuDataPoint = {
  dataSource: string;
  apiUrl: string;
  message: string;
  type: string;
  apiProperty: string
}

export type MenuAlert = {
  type: AlertType;
  message: string;

}

export interface MenuItem {
  title: string;
  url: string;
  image: string;
  options: { label: string, url: string, urlParams: Params }[];
  description?: string;
  urlParams?: Params;
  icon: string;
  permissions: string[];
}
export interface DashboardItem extends MenuItem {
  apiCountUrl?: string;
  apiCountText?: string;
  actions?: DataActionsButton[];
  alerts?: MenuAlert[],
  dataPoints?: MenuDataPoint[]
}
