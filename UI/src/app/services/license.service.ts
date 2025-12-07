import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { LicenseStatus, ActivationResponse, DruglanePMSResponse } from '../models/license.model';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  private readonly API_BASE = '/api/license';
  private readonly EXTERNAL_API = 'https://druglanepms.calgadsoftwares.com/api_admin/findBranchByKey';

  private activationStatusSubject = new BehaviorSubject<LicenseStatus>({ isActivated: false });
  public activationStatus$ = this.activationStatusSubject.asObservable();

  constructor(private http: HttpClient) {}

  checkActivationStatus(): Observable<LicenseStatus> {
    return this.http.get<LicenseStatus>(`${this.API_BASE}/status`).pipe(
      tap(status => this.activationStatusSubject.next(status)),
      catchError(() => {
        const status: LicenseStatus = { isActivated: false };
        this.activationStatusSubject.next(status);
        return of(status);
      })
    );
  }

  activate(activationKey: string): Observable<ActivationResponse> {
    // Call the external API directly to get facility data
    return this.http.get<DruglanePMSResponse>(`${this.EXTERNAL_API}?k=${activationKey}`).pipe(
      map(response => {
        if (response.success && response.data) {
          // Transform external API response to our format
          const facilityData = {
            name: response.data.branch_name,
            phone: response.data.phone,
            email: response.data.email,
            location: response.data.location,
            contactPerson: response.data.contact_person,
            registrationNumber: response.data.registration_number,
            licenseNumber: response.data.license_number
          };

          // Now save to our local API
          this.saveActivation(activationKey, facilityData).subscribe();

          return {
            success: true,
            message: 'Activation successful',
            facilityData
          };
        } else {
          return {
            success: false,
            message: response.message || 'Invalid activation key'
          };
        }
      }),
      catchError(error => {
        console.error('Activation error:', error);
        return of({
          success: false,
          message: 'Failed to validate activation key. Please check your internet connection.'
        });
      })
    );
  }

  private saveActivation(activationKey: string, facilityData: any): Observable<any> {
    return this.http.post(`${this.API_BASE}/activate`, {
      activationKey,
      facilityData
    }).pipe(
      tap(() => {
        // Update activation status
        this.activationStatusSubject.next({
          isActivated: true,
          ...facilityData
        });
      }),
      catchError(error => {
        console.error('Failed to save activation locally:', error);
        return of(null);
      })
    );
  }

  isActivated(): boolean {
    return this.activationStatusSubject.value.isActivated;
  }
}
