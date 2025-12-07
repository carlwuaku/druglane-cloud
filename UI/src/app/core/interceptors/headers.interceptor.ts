import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const headersInterceptor: HttpInterceptorFn = (request, next) => {
  const authToken = inject(AuthService).getAuthToken();
  //skip the login and appName requests
  if (request.url.endsWith('/mobile_login') || request.url.endsWith('/appName')) {
    return next(request);
  }
  let headers: HttpHeaders = request.headers;

  if (authToken) {
    headers = headers.set('Authorization', `Bearer ${authToken}`)
  }
  const modifiedRequest = request.clone({
    headers: headers
  })
  return next(modifiedRequest);
};
