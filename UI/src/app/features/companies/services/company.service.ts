import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from '../../../core/models/user.model';
import { HttpService } from '../../../core/services/http/http.service';

export interface CompanyListResponse {
    data: Company[];
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
}

export interface CompanyResponse {
    data: Company;
}

export interface AdminStatistics {
    total_companies: number;
    active_companies: number;
    inactive_companies: number;
    expired_companies: number;
    expiring_soon: number;
    total_company_users: number;
    recently_active_users: number;
    inactive_users: number;
    no_backup_last_week: number;
    no_backup_last_month: number;
    no_backup_last_year: number;
    never_uploaded: number;
    recent_uploads: number;
    total_storage_bytes: number;
    total_storage_formatted: string;
}

@Injectable({
    providedIn: 'root'
})
export class CompanyService {
    private httpService = inject(HttpService);

    /**
     * Get all companies with pagination and filters
     */
    getCompanies(page: number = 1, perPage: number = 15, filters?: {
        search?: string;
        status?: string;
        backup_filter?: string;
    }): Observable<CompanyListResponse> {
        let url = `api/companies?page=${page}&per_page=${perPage}`;

        if (filters?.search) {
            url += `&search=${encodeURIComponent(filters.search)}`;
        }
        if (filters?.status) {
            url += `&status=${filters.status}`;
        }
        if (filters?.backup_filter) {
            url += `&backup_filter=${filters.backup_filter}`;
        }

        return this.httpService.get<CompanyListResponse>(url);
    }

    /**
     * Get a single company by ID
     */
    getCompany(id: number): Observable<Company> {
        return this.httpService.get<Company>(`api/companies/${id}`);
    }

    /**
     * Create a new company
     */
    createCompany(data: Partial<Company>): Observable<Company> {
        return this.httpService.post<Company>('api/companies', data);
    }

    /**
     * Update an existing company
     */
    updateCompany(id: number, data: Partial<Company>): Observable<Company> {
        return this.httpService.put<Company>(`api/companies/${id}`, data);
    }

    /**
     * Delete a company
     */
    deleteCompany(id: number): Observable<void> {
        return this.httpService.delete<void>(`api/companies/${id}`);
    }

    /**
     * Activate a company
     */
    activateCompany(id: number): Observable<Company> {
        return this.httpService.post<Company>(`api/companies/${id}/activate`, {});
    }

    /**
     * Deactivate a company
     */
    deactivateCompany(id: number): Observable<Company> {
        return this.httpService.post<Company>(`api/companies/${id}/deactivate`, {});
    }

    /**
     * Renew company license
     */
    renewLicense(id: number, data: { license_expires_at: string }): Observable<Company> {
        return this.httpService.post<Company>(`api/companies/${id}/renew-license`, data);
    }

    /**
     * Get admin dashboard statistics
     */
    getAdminStatistics(): Observable<AdminStatistics> {
        return this.httpService.get<AdminStatistics>('api/admin/statistics');
    }
}
