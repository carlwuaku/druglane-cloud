import { inject } from '@angular/core';
import { LicenseService } from '../services/license/license.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * APP_INITIALIZER factory function to check license status on app startup
 * This ensures the license status is checked before the app fully loads
 */
export function initializeLicense(): () => Observable<boolean> {
  const licenseService = inject(LicenseService);

  return () => {
    return licenseService.checkLicenseStatus().pipe(
      map(() => {
        // License check completed successfully
        return true;
      }),
      catchError((error) => {
        // If license check fails, still allow app to load
        // The guard will handle redirecting to activation page
        console.error('Error checking license on startup:', error);
        return of(true);
      })
    );
  };
}
