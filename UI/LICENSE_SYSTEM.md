# License Activation System - Frontend Implementation

This document describes the Angular frontend implementation of the license activation system for the Drug Lane POS application.

## Overview

The license activation system ensures that the application can only be used after proper activation with a valid 20-character activation key. The system includes:

- **Activation Page**: User-friendly interface for entering activation keys
- **License Guard**: Prevents access to protected routes without activation
- **License Interceptor**: Handles 402 Payment Required responses
- **License Service**: Manages license status and API communication
- **License Status Component**: Displays current license information

## Architecture

### 1. License Service
**Location**: `src/app/core/services/license/license.service.ts`

The central service that manages all license-related operations:

```typescript
// Check license status
licenseService.checkLicenseStatus().subscribe(status => {
  console.log('Is Activated:', status.isActivated);
});

// Activate system
licenseService.activate('XXXXX-XXXXX-XXXXX-XXXXX').subscribe(response => {
  if (response.success) {
    console.log('Activation successful!');
  }
});

// Check cached status
const isActivated = licenseService.isActivated();
```

**Key Features**:
- Caches license status to minimize API calls
- Observable-based for reactive updates
- Provides both sync and async methods

### 2. License Guard
**Location**: `src/app/core/guards/license.guard.ts`

A route guard that checks license activation before allowing access:

```typescript
// In app.routes.ts
{
  path: 'home',
  component: HomeComponent,
  canActivate: [licenseGuard, authGuard],  // License check happens first
}
```

**Behavior**:
- Checks cached license status first (fast path)
- Falls back to API call if no cached data
- Redirects to `/activate` if not activated
- Allows activation page to be accessed without license

### 3. License Interceptor
**Location**: `src/app/core/interceptors/license.interceptor.ts`

HTTP interceptor that handles 402 Payment Required responses:

```typescript
// Registered in app.config.ts
provideHttpClient(
  withInterceptors([headersInterceptor, licenseInterceptor, errorInterceptor])
)
```

**Behavior**:
- Intercepts all HTTP responses
- Detects 402 status codes (license not activated)
- Clears cached license status
- Shows notification to user
- Redirects to activation page

### 4. APP_INITIALIZER
**Location**: `src/app/core/initializers/license.initializer.ts`

Runs on app startup to check license status:

```typescript
// Registered in app.config.ts
{
  provide: APP_INITIALIZER,
  useFactory: initializeLicense,
  multi: true
}
```

**Purpose**:
- Checks license status before app fully loads
- Populates license cache early
- Enables fast guard checks

## Components

### Activation Component
**Location**: `src/app/features/license/activate.component.ts`

A full-featured activation page with:

- **Segmented Input**: 4 segments of 5 characters each
- **Auto-formatting**: Converts to uppercase, removes invalid characters
- **Auto-focus**: Automatically moves to next segment
- **Paste Support**: Handles full 20-character paste
- **Validation**: Ensures exactly 20 alphanumeric characters
- **Loading State**: Shows spinner during activation
- **Success View**: Displays facility information after activation
- **Auto-redirect**: Redirects to home after successful activation

**Usage in Template**:
```html
<!-- Route is configured in app.routes.ts -->
<!-- Accessed at /activate -->
```

### License Status Component
**Location**: `src/app/features/license/license-status.component.ts`

A compact component showing license status:

```html
<!-- Add to navbar or header -->
<app-license-status />
```

**Features**:
- Shows "Licensed" badge when activated
- Shows "Not Activated" badge when not activated
- Displays days until expiration (if applicable)
- Warning badge when < 30 days remaining
- Click to navigate to activation page
- Tooltip with full license details
- Responsive (hides text on mobile)

## API Integration

### Endpoints Used

1. **GET /api/license/status**
   - Checks if system is activated
   - Returns license details if activated
   - Response:
     ```json
     {
       "isActivated": true,
       "facilityName": "Example Pharmacy",
       "licenseNumber": "LIC-12345",
       "activatedOn": "2025-01-01T00:00:00Z",
       "expiresOn": "2026-01-01T00:00:00Z",
       "daysUntilExpiration": 365
     }
     ```

2. **POST /api/license/activate**
   - Activates system with activation key
   - Request:
     ```json
     {
       "activationKey": "XXXXX-XXXXX-XXXXX-XXXXX"
     }
     ```
   - Response:
     ```json
     {
       "success": true,
       "message": "Activation successful",
       "facilityData": {
         "name": "Example Pharmacy",
         "licenseNumber": "LIC-12345",
         ...
       }
     }
     ```

## Routing Configuration

**Location**: `src/app/app.routes.ts`

```typescript
export const routes: Routes = [
  // Activation page - No guards (always accessible)
  {
    path: 'activate',
    loadComponent: () => import('./features/license/activate.component')
  },

  // Login - Requires license
  {
    path: 'login',
    loadComponent: () => import('./core/pages/login/login.component'),
    canActivate: [licenseGuard]
  },

  // Home - Requires license AND auth
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [licenseGuard, authGuard]
  }
];
```

## User Flow

### First-Time User (Not Activated)
1. User opens application
2. APP_INITIALIZER checks license status
3. License guard detects no activation
4. User redirected to `/activate`
5. User enters 20-character activation key
6. System validates key with backend
7. Success message and facility info displayed
8. Auto-redirect to home page (3 seconds)

### Activated User
1. User opens application
2. APP_INITIALIZER checks license status
3. License status cached
4. License guard allows access
5. User proceeds to login/home

### License Expires During Session
1. User makes API request
2. Backend returns 402 Payment Required
3. License interceptor catches response
4. User notified of expiration
5. User redirected to `/activate`
6. Must re-activate to continue

## Integration Guide

### Adding License Status to Navbar

```typescript
// In your navbar component
import { LicenseStatusComponent } from './features/license';

@Component({
  selector: 'app-navbar',
  imports: [LicenseStatusComponent],
  template: `
    <nav>
      <div class="nav-brand">Drug Lane POS</div>
      <div class="nav-actions">
        <app-license-status />
        <!-- other nav items -->
      </div>
    </nav>
  `
})
export class NavbarComponent { }
```

### Checking License in Components

```typescript
import { LicenseService } from './core/services/license/license.service';

export class MyComponent {
  private licenseService = inject(LicenseService);

  ngOnInit() {
    // Subscribe to status changes
    this.licenseService.licenseStatus$.subscribe(status => {
      if (status?.isActivated) {
        console.log('Licensed to:', status.facilityName);

        // Check expiration
        if (status.daysUntilExpiration && status.daysUntilExpiration < 30) {
          this.showExpirationWarning(status.daysUntilExpiration);
        }
      }
    });
  }
}
```

### Adding Guards to New Routes

```typescript
// Always add licenseGuard before authGuard
{
  path: 'my-feature',
  component: MyFeatureComponent,
  canActivate: [licenseGuard, authGuard]  // License first!
}
```

## Testing

### Manual Testing

1. **Test Activation Flow**:
   - Clear browser storage
   - Navigate to app
   - Should redirect to `/activate`
   - Enter valid activation key
   - Should show success and redirect

2. **Test Guard**:
   - After activation, manually navigate to `/home`
   - Should be allowed
   - Clear activation in backend
   - Navigate to `/home`
   - Should redirect to `/activate`

3. **Test Interceptor**:
   - While logged in with expired license
   - Make any API request
   - Should catch 402 response
   - Should redirect to `/activate`

4. **Test Status Component**:
   - Check badge shows "Licensed" when activated
   - Check tooltip shows correct info
   - Check days remaining warning appears

### Integration Testing

```typescript
describe('License System', () => {
  it('should redirect to activation when not activated', () => {
    // Mock license service to return not activated
    // Navigate to protected route
    // Expect redirect to /activate
  });

  it('should allow access when activated', () => {
    // Mock license service to return activated
    // Navigate to protected route
    // Expect successful navigation
  });

  it('should handle 402 responses', () => {
    // Mock HTTP response with 402
    // Expect redirect to /activate
    // Expect notification shown
  });
});
```

## Troubleshooting

### User can access app without activation
- Check that `licenseGuard` is added to routes
- Verify guard is before `authGuard` in canActivate array
- Check APP_INITIALIZER is registered
- Verify backend middleware is active

### Activation page shows error
- Check network tab for API errors
- Verify activation key format (20 alphanumeric)
- Check backend logs for validation errors
- Ensure CORS is configured correctly

### License status not updating
- Check that LicenseService is singleton (providedIn: 'root')
- Verify BehaviorSubject is emitting values
- Check component subscriptions are active
- Clear browser cache and retry

## Security Considerations

1. **No Bypass**: The activation page is the only unguarded route
2. **Server-Side Validation**: All activation validation happens on backend
3. **Status Caching**: Cached status is refreshed on each app load
4. **Interceptor First**: License interceptor runs before error interceptor
5. **No Local Key Storage**: Activation key is never stored in frontend

## Future Enhancements

- Add license renewal flow
- Add "grace period" warning banner
- Add offline license checking
- Add multi-tenant license management
- Add license usage analytics
- Add automated expiration notifications
