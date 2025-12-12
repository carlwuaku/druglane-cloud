import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http/http.service';

export interface CompanyDataResponse<T = any> {
    data: T[];
    total: number;
    displayColumns: string[];
    columnLabels: { [key: string]: string };
    columnFilters?: any[];
}

@Injectable({
    providedIn: 'root'
})
export class CompanyDataService {

    constructor(private http: HttpService) { }

    /**
     * Get paginated products for the authenticated company user.
     */
    getProducts(page: number = 0, limit: number = 100, search?: string): Observable<CompanyDataResponse> {
        let url = `/api/company-data/products?page=${page}&limit=${limit}`;
        if (search) {
            url += `&param=${encodeURIComponent(search)}`;
        }
        return this.http.get<CompanyDataResponse>(url);
    }

    /**
     * Get paginated sales for the authenticated company user.
     */
    getSales(page: number = 0, limit: number = 100, search?: string, startDate?: string, endDate?: string): Observable<CompanyDataResponse> {
        let url = `/api/company-data/sales?page=${page}&limit=${limit}`;
        if (search) {
            url += `&param=${encodeURIComponent(search)}`;
        }
        if (startDate) {
            url += `&start_date=${startDate}`;
        }
        if (endDate) {
            url += `&end_date=${endDate}`;
        }
        return this.http.get<CompanyDataResponse>(url);
    }

    /**
     * Get paginated purchases for the authenticated company user.
     */
    getPurchases(page: number = 0, limit: number = 100, search?: string, startDate?: string, endDate?: string): Observable<CompanyDataResponse> {
        let url = `/api/company-data/purchases?page=${page}&limit=${limit}`;
        if (search) {
            url += `&param=${encodeURIComponent(search)}`;
        }
        if (startDate) {
            url += `&start_date=${startDate}`;
        }
        if (endDate) {
            url += `&end_date=${endDate}`;
        }
        return this.http.get<CompanyDataResponse>(url);
    }
}
