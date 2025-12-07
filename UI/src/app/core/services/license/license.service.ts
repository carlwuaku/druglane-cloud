import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../http/http.service';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface LicenseStatus {
  isActivated: boolean;
  facilityName?: string;
  phone?: string;
  email?: string;
  location?: string;
  contactPerson?: string;
  registrationNumber?: string;
  licenseNumber?: string;
  activatedOn?: Date;
  expiresOn?: Date;
  daysUntilExpiration?: number;
  message?: string;
}

export interface ActivateResponse {
  success: boolean;
  message: string;
  facilityData?: {
    name: string;
    phone: string;
    email: string;
    location: string;
    contactPerson: string;
    registrationNumber: string;
    licenseNumber: string;
    expiresOn: Date;
  };
}

// Response from external Druglane PMS API
export interface DruglanePMSResponse {
  success: boolean;
  message: string;
  data?: {
    branch_name: string;
    phone: string;
    email: string;
    location: string;
    contact_person: string;
    registration_number: string;
    license_number: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  private httpService = inject(HttpService);
  private http = inject(HttpClient);
  private router = inject(Router);

  // External Druglane PMS API endpoint
  private readonly EXTERNAL_API = 'https://druglanepms.calgadsoftwares.com/api_admin/findBranchByKey';

  // Observable to track license activation status
  private licenseStatusSubject = new BehaviorSubject<LicenseStatus | null>(null);
  public licenseStatus$ = this.licenseStatusSubject.asObservable();

  constructor() { }

  /**
   * Check if the system is activated
   */
  checkLicenseStatus(): Observable<LicenseStatus> {
    return this.httpService.get<LicenseStatus>('api/license/status').pipe(
      tap(status => {
        this.licenseStatusSubject.next(status);
      }),
      catchError(error => {
        console.error('Error checking license status', error);
        const status: LicenseStatus = {
          isActivated: false,
          message: 'Unable to verify license status'
        };
        this.licenseStatusSubject.next(status);
        return of(status);
      })
    );
  }

  /**
   * Activate the system with an activation key
   * First calls external Druglane PMS API to validate and get facility data
   * Then saves to local backend
   */
  activate(activationKey: string): Observable<ActivateResponse> {
    // Remove any non-digit characters
    const cleanKey = activationKey.replace(/[^0-9]/g, '');

    // Call the external API to get facility data
    return this.http.get<DruglanePMSResponse>(`${this.EXTERNAL_API}?k=${cleanKey}`).pipe(
      switchMap(response => {
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

          // Now save to our local backend
          return this.httpService.post<ActivateResponse>('api/license/activate', {
            activationKey: cleanKey,
            facilityData: facilityData
          }).pipe(
            map(() => ({
              success: true,
              message: 'Activation successful',
              facilityData: {
                ...facilityData,
                expiresOn: new Date() // Will be set by backend if needed
              }
            })),
            tap(() => {
              // Refresh license status after successful activation
              this.checkLicenseStatus().subscribe();
            })
          );
        } else {
          return throwError(() => new Error(response.message || 'Invalid activation key'));
        }
      }),
      catchError(error => {
        console.error('Activation error:', error);
        const errorMessage = error.error?.message || error.message || 'Activation failed. Please check your key and try again.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Check if system is activated (synchronous check from cached data)
   */
  isActivated(): boolean {
    const currentStatus = this.licenseStatusSubject.value;
    return currentStatus?.isActivated ?? false;
  }

  /**
   * Get current license status from cache
   */
  getCurrentStatus(): LicenseStatus | null {
    return this.licenseStatusSubject.value;
  }

  /**
   * Navigate to activation page
   */
  navigateToActivation(): void {
    this.router.navigate(['/activate']);
  }

  /**
   * Clear cached license status
   */
  clearStatus(): void {
    this.licenseStatusSubject.next(null);
  }
}
