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

export interface ProductStatistics {
    total_stock_value: number;
    total_cost_value: number;
    below_min_stock_count: number;
    above_max_stock_count: number;
    zero_stock_count: number;
    total_products: number;
}

export interface SalesStatistics {
    total_sales: number;
    today_sales: number;
    current_month_sales: number;
    last_month_sales: number;
    top_product_by_value: {
        name: string;
        total_value: number;
    };
    top_product_by_quantity: {
        name: string;
        total_quantity: number;
    };
    total_transactions: number;
    current_month_transactions: number;
    last_month_transactions: number;
    growth_rate: number;
    average_order_value: number;
    current_month_profit: number;
    last_month_profit: number;
    profit_margin_percentage: number;
    current_week_sales: number;
    last_week_sales: number;
    week_over_week_growth: number;
    ytd_sales: number;
    top_5_products: Array<{
        name: string;
        total_value: number;
        total_quantity: number;
    }>;
}

export interface PurchaseStatistics {
    total_purchases: number;
    today_purchases: number;
    current_month_purchases: number;
    last_month_purchases: number;
    current_week_purchases: number;
    last_week_purchases: number;
    ytd_purchases: number;
    total_transactions: number;
    current_month_transactions: number;
    growth_rate: number;
    week_over_week_growth: number;
    average_purchase_value: number;
    top_product_by_value: {
        name: string;
        total_value: number;
    };
    top_product_by_quantity: {
        name: string;
        total_quantity: number;
    };
    top_5_products: Array<{
        name: string;
        total_value: number;
        total_quantity: number;
    }>;
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
        let url = `api/company-data/purchases?page=${page}&limit=${limit}`;
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
     * Get product statistics for the authenticated company user.
     */
    getProductStatistics(): Observable<ProductStatistics> {
        return this.http.get<ProductStatistics>('api/company-data/product-statistics');
    }

    /**
     * Get sales statistics for the authenticated company user.
     */
    getSalesStatistics(startDate?: string, endDate?: string): Observable<SalesStatistics> {
        let url = 'api/company-data/sales-statistics';
        const params: string[] = [];
        if (startDate) params.push(`start_date=${startDate}`);
        if (endDate) params.push(`end_date=${endDate}`);
        if (params.length > 0) url += `?${params.join('&')}`;
        return this.http.get<SalesStatistics>(url);
    }

    /**
     * Get sales details (individual items sold) for the authenticated company user.
     */
    getSalesDetails(page: number = 0, limit: number = 100, search?: string, startDate?: string, endDate?: string): Observable<CompanyDataResponse> {
        let url = `api/company-data/sales-details?page=${page}&limit=${limit}`;
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
     * Get purchase statistics for the authenticated company user.
     */
    getPurchaseStatistics(startDate?: string, endDate?: string): Observable<PurchaseStatistics> {
        let url = 'api/company-data/purchase-statistics';
        const params: string[] = [];
        if (startDate) params.push(`start_date=${startDate}`);
        if (endDate) params.push(`end_date=${endDate}`);
        if (params.length > 0) url += `?${params.join('&')}`;
        return this.http.get<PurchaseStatistics>(url);
    }

    /**
     * Get purchase details (individual items purchased) for the authenticated company user.
     */
    getPurchaseDetails(page: number = 0, limit: number = 100, search?: string, startDate?: string, endDate?: string): Observable<CompanyDataResponse> {
        let url = `api/company-data/purchase-details?page=${page}&limit=${limit}`;
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
     * Get database upload information for the company.
     */
    getDatabaseInfo(): Observable<DatabaseInfo> {
        return this.http.get<DatabaseInfo>('api/company-data/database-info');
    }
}

export interface DatabaseInfo {
    upload_date: string | null;
    upload_date_formatted: string | null;
    upload_date_relative: string | null;
    file_size: number | null;
    file_size_formatted: string | null;
    original_filename: string | null;
    message?: string;
}
