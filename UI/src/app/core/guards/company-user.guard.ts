import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const companyUserGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getUser().pipe(
    map(user => {
      if (user.isCompanyUser) {
        return true;
      } else {
        router.navigate(['/dashboard']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
