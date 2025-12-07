import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LicenseService } from '../services/license/license.service';
import { map, catchError, of } from 'rxjs';

/**
 * Guard to check if the system is activated
 * Redirects to activation page if not activated
 */
export const licenseGuard: CanActivateFn = (route, state) => {
  const licenseService = inject(LicenseService);
  const router = inject(Router);

  // Check if we already have cached status
  const cachedStatus = licenseService.getCurrentStatus();
  if (cachedStatus !== null) {
    if (cachedStatus.isActivated) {
      return true;
    } else {
      router.navigate(['/activate']);
      return false;
    }
  }

  // Fetch license status from API
  return licenseService.checkLicenseStatus().pipe(
    map(status => {
      if (status.isActivated) {
        return true;
      } else {
        router.navigate(['/activate']);
        return false;
      }
    }),
    catchError(error => {
      console.error('License guard error:', error);
      // On error, redirect to activation page to be safe
      router.navigate(['/activate']);
      return of(false);
    })
  );
};
