# Angular Frontend Setup Guide

This guide will help you set up the Angular frontend for Druglane Cloud.

## Prerequisites

1. Node.js 18+ installed
2. npm installed
3. Angular CLI installed globally:
   ```bash
   npm install -g @angular/cli
   ```

## Step 1: Create Angular Application

Navigate to the project root and create the Angular application:

```bash
# From the druglane-cloud directory
ng new frontend --routing --style=scss --skip-git
```

When prompted:
- Would you like to add Angular routing? **Yes**
- Which stylesheet format would you like to use? **SCSS**

## Step 2: Navigate to Frontend Directory

```bash
cd frontend
```

## Step 3: Install Additional Dependencies

Install commonly needed packages for API integration and UI:

```bash
# HTTP client (already included in Angular 15+)
# UI framework (optional - choose one)

# Option 1: Angular Material
ng add @angular/material

# Option 2: Bootstrap
npm install bootstrap @ng-bootstrap/ng-bootstrap

# Option 3: PrimeNG
npm install primeng primeicons
```

## Step 4: Configure API Base URL

Create environment files for different configurations:

**src/environments/environment.development.ts**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  appUrl: 'http://localhost:4200'
};
```

**src/environments/environment.ts**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.druglane.com/api',
  appUrl: 'https://app.druglane.com'
};
```

## Step 5: Create API Service

Generate the API service:

```bash
ng generate service core/services/api
```

**src/app/core/services/api.service.ts**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders()
    });
  }
}
```

## Step 6: Create Authentication Service

Generate the authentication service:

```bash
ng generate service core/services/auth
```

**src/app/core/services/auth.service.ts**
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

interface User {
  id: number;
  name: string;
  email: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService) {
    this.loadCurrentUser();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('login', { email, password }).pipe(
      tap(response => {
        localStorage.setItem('auth_token', response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  signup(name: string, email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('signup', {
      name,
      email,
      password,
      password_confirmation: password
    }).pipe(
      tap(response => {
        localStorage.setItem('auth_token', response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): Observable<any> {
    return this.api.post('logout', {}).pipe(
      tap(() => {
        localStorage.removeItem('auth_token');
        this.currentUserSubject.next(null);
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.api.get<User>('user').pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private loadCurrentUser(): void {
    if (this.isAuthenticated()) {
      this.getCurrentUser().subscribe();
    }
  }
}
```

## Step 7: Create Auth Guard

Generate the auth guard:

```bash
ng generate guard core/guards/auth
```

Select: `CanActivate`

**src/app/core/guards/auth.guard.ts**
```typescript
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
```

## Step 8: Update App Module Configuration

Ensure HttpClient is provided in your app configuration.

For standalone components (Angular 17+), update **src/app/app.config.ts**:
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi())
  ]
};
```

## Step 9: Create Basic Components

```bash
# Create authentication components
ng generate component features/auth/login
ng generate component features/auth/signup

# Create dashboard
ng generate component features/dashboard

# Create layout components
ng generate component shared/components/header
ng generate component shared/components/sidebar
```

## Step 10: Configure Routing

Update **src/app/app.routes.ts**:
```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup.component')
      .then(m => m.SignupComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
```

## Step 11: Configure Proxy (Development)

Create **proxy.conf.json** in the frontend directory:

```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

Update **angular.json** to use the proxy:

Find the "serve" configuration and add:
```json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

## Step 12: Start Development Server

```bash
ng serve
```

The application will be available at `http://localhost:4200`

## Recommended Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── http-error.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts
│   │   │   │   └── auth.service.ts
│   │   │   └── models/
│   │   │       └── user.model.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── signup/
│   │   │   ├── dashboard/
│   │   │   ├── companies/
│   │   │   ├── backups/
│   │   │   └── inventory/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   └── sidebar/
│   │   │   └── pipes/
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── assets/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.development.ts
│   └── styles.scss
├── angular.json
├── package.json
├── proxy.conf.json
└── tsconfig.json
```

## Next Steps

1. Implement login and signup forms
2. Create dashboard layout
3. Implement company management UI
4. Implement backup management UI
5. Create inventory viewer
6. Add charts and analytics

## Useful Commands

```bash
# Generate a new component
ng generate component features/companies/company-list

# Generate a service
ng generate service features/companies/company

# Generate a model (interface)
ng generate interface core/models/company

# Build for production
ng build --configuration production

# Run tests
ng test

# Run linter
ng lint
```

## Testing the Setup

Create a simple test in your login component to verify the API connection:

```typescript
// In login.component.ts
onLogin() {
  this.authService.login(this.email, this.password).subscribe({
    next: (response) => {
      console.log('Login successful', response);
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      console.error('Login failed', error);
    }
  });
}
```

## Troubleshooting

### CORS Issues
- Ensure Laravel backend is configured with correct CORS settings
- Check that `CORS_ALLOWED_ORIGINS` in `.env` includes `http://localhost:4200`

### 401 Unauthorized
- Verify token is being stored in localStorage
- Check Authorization header is being sent
- Ensure Sanctum is properly configured in Laravel

### API Connection Failed
- Verify Laravel server is running: `php artisan serve`
- Check proxy configuration in `proxy.conf.json`
- Verify API URL in environment files

## Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [RxJS Documentation](https://rxjs.dev/)
- [Laravel Sanctum SPA Authentication](https://laravel.com/docs/sanctum#spa-authentication)
