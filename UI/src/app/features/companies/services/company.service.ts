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

@Injectable({
    providedIn: 'root'
})
export class CompanyService {
    private httpService = inject(HttpService);

    /**
     * Get all companies with pagination
     */
    getCompanies(page: number = 1, perPage: number = 15): Observable<CompanyListResponse> {
        return this.httpService.get<CompanyListResponse>(`api/companies?page=${page}&per_page=${perPage}`);
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
}
