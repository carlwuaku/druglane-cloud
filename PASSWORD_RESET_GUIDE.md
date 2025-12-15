# Password Reset Implementation Guide

## Overview

This guide explains the password reset functionality implemented in Druglane Cloud, allowing users to securely reset their passwords via email.

## Features

### Backend (Laravel)

1. **Password Reset Request** - Users can request a password reset link
2. **Email Notification** - Automated email with reset link sent to users
3. **Token Verification** - Secure token validation before password reset
4. **Password Reset** - Users can set a new password using the token

### Frontend (Angular)

1. **Forgot Password Page** - Clean UI for requesting password reset
2. **Reset Password Page** - Secure form for setting new password with:
   - Real-time password strength indicator
   - Password match validation
   - Password requirements checklist
   - Token verification

## Backend Implementation

### 1. Controller: `PasswordResetController.php`

Located at: [app/Http/Controllers/Api/PasswordResetController.php](app/Http/Controllers/Api/PasswordResetController.php)

**Methods**:
- `sendResetLink(Request $request)` - Generates token and sends email
- `resetPassword(Request $request)` - Validates token and updates password
- `verifyToken(Request $request)` - Checks if token is valid

**Features**:
- Tokens expire after 60 minutes
- Uses bcrypt for token hashing
- Security-conscious (doesn't reveal if email exists)
- Automatic cleanup of old tokens

### 2. Email Notification: `ResetPasswordNotification.php`

Located at: [app/Notifications/ResetPasswordNotification.php](app/Notifications/ResetPasswordNotification.php)

**Features**:
- Queued for background processing (implements `ShouldQueue`)
- Professional email template with action button
- Configurable frontend URL via `FRONTEND_URL` environment variable
- Clear expiry information (60 minutes)

### 3. API Routes

Added to: [routes/api.php](routes/api.php:22-25)

```php
Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);
Route::post('/password/verify-token', [PasswordResetController::class, 'verifyToken']);
```

### 4. Email Configuration

**Environment Variables** (`.env`):
```env
MAIL_MAILER=smtp
MAIL_HOST=mailpit          # For local development
MAIL_PORT=1025             # Mailpit port
MAIL_FROM_ADDRESS="noreply@druglane.com"
MAIL_FROM_NAME="${APP_NAME}"

FRONTEND_URL=http://localhost:4200  # Angular app URL
```

**Production SMTP Configuration**:
For production, update these variables with your SMTP provider details:
```env
MAIL_HOST=smtp.gmail.com   # Example for Gmail
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

## Frontend Implementation

### 1. Auth Service Updates

Located at: [UI/src/app/core/services/auth/auth.service.ts](UI/src/app/core/services/auth/auth.service.ts:95-122)

**New Methods**:
- `sendPasswordResetLink(email: string)` - Request reset link
- `resetPassword(token, email, password, password_confirmation)` - Reset password
- `verifyResetToken(token, email)` - Verify token validity

### 2. Forgot Password Component

Located at: [UI/src/app/core/pages/forgot-password/](UI/src/app/core/pages/forgot-password/)

**Features**:
- Email validation
- Success message after sending
- Loading states
- Responsive design matching login page
- "Back to Login" link

**Files**:
- `forgot-password.component.ts` - Component logic
- `forgot-password.component.html` - Template
- `forgot-password.component.scss` - Styles (imports login styles)

### 3. Reset Password Component

Located at: [UI/src/app/core/pages/reset-password/](UI/src/app/core/pages/reset-password/)

**Features**:
- Token verification on page load
- Password strength indicator (weak/medium/strong)
- Real-time password match validation
- Requirements checklist with visual indicators
- Password visibility toggle
- Loading states during verification and submission
- Automatic redirect after successful reset
- Error handling for expired/invalid tokens

**Files**:
- `reset-password.component.ts` - Component logic with token verification
- `reset-password.component.html` - Template with strength indicator
- `reset-password.component.scss` - Styles for strength bar and requirements

### 4. Routes

Added to: [UI/src/app/app.routes.ts](UI/src/app/app.routes.ts:35-46)

```typescript
{
    path: 'forgot-password',
    data: { title: 'Forgot Password' },
    loadComponent: () => import('./core/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
},
{
    path: 'reset-password',
    data: { title: 'Reset Password' },
    loadComponent: () => import('./core/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
}
```

## User Flow

1. **User forgets password**
   - User clicks "Forgot Password?" on login page
   - Navigates to `/forgot-password`

2. **Request reset link**
   - User enters email address
   - Clicks "Send Reset Link"
   - Backend generates token and sends email
   - Success message displayed

3. **Receive email**
   - User receives email with reset link
   - Link format: `http://localhost:4200/reset-password?token=xxx&email=user@example.com`
   - Link expires in 60 minutes

4. **Reset password**
   - User clicks link in email
   - Navigates to `/reset-password`
   - Token is automatically verified
   - If valid, user sees password reset form
   - If invalid/expired, shown error with option to request new link

5. **Set new password**
   - User enters new password (min 8 characters)
   - Confirms password
   - Password strength shown in real-time
   - Requirements checklist updates as user types
   - Clicks "Reset Password"
   - Password updated successfully
   - Automatic redirect to login page

6. **Login with new password**
   - User logs in with new password

## Security Features

### Backend
- Tokens are hashed using bcrypt before storage
- Tokens expire after 60 minutes
- Old tokens automatically deleted when generating new ones
- Doesn't reveal if email exists (generic success message)
- Password must be at least 8 characters and confirmed
- Token validation before password reset

### Frontend
- Token verified before showing reset form
- Client-side password strength validation
- Password match validation
- Clear visual feedback for security requirements
- Automatic redirect to prevent reuse of tokens

## Testing

### Local Testing with Mailpit

Mailpit is already configured for local development:

1. **Install Mailpit** (if not already installed):
   ```bash
   brew install mailpit  # macOS
   ```

2. **Start Mailpit**:
   ```bash
   mailpit
   ```

3. **Access Mailpit UI**: http://localhost:8025

4. **Test Password Reset**:
   - Go to `http://localhost:4200/forgot-password`
   - Enter any registered user email
   - Check Mailpit UI for the email
   - Click the reset link in the email
   - Set new password

### Testing Flow

1. **Test Forgot Password**:
   ```
   POST http://localhost:8000/api/password/forgot
   Body: { "email": "user@example.com" }
   ```

2. **Check Email in Mailpit**: http://localhost:8025

3. **Test Token Verification**:
   ```
   POST http://localhost:8000/api/password/verify-token
   Body: { "token": "xxx", "email": "user@example.com" }
   ```

4. **Test Password Reset**:
   ```
   POST http://localhost:8000/api/password/reset
   Body: {
     "token": "xxx",
     "email": "user@example.com",
     "password": "newpassword123",
     "password_confirmation": "newpassword123"
   }
   ```

## Production Deployment

### 1. Configure SMTP Settings

Update `.env` with production SMTP credentials:

**Gmail Example**:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@druglane.com"
MAIL_FROM_NAME="Druglane Cloud"
```

**SendGrid Example**:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls
```

### 2. Set Frontend URL

Update frontend URL in `.env`:
```env
FRONTEND_URL=https://yourdomain.com
```

### 3. Queue Configuration (Recommended)

For production, use a queue driver instead of sync:

```env
QUEUE_CONNECTION=redis  # or database, sqs, etc.
```

Run queue worker:
```bash
php artisan queue:work
```

### 4. Clear Config Cache

After updating `.env`:
```bash
php artisan config:clear
php artisan config:cache
```

## Troubleshooting

### Emails Not Sending

1. **Check Mailpit is running** (local):
   ```bash
   mailpit
   ```

2. **Verify SMTP credentials** (production)

3. **Check Laravel logs**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

4. **Test mail configuration**:
   ```bash
   php artisan tinker
   Mail::raw('Test email', function ($message) {
       $message->to('test@example.com')->subject('Test');
   });
   ```

### Token Expired/Invalid

- Tokens expire after 60 minutes
- Request a new reset link if expired
- Check system time is correct

### Password Reset Link Not Working

1. Check `FRONTEND_URL` is set correctly in `.env`
2. Verify Angular routes are configured
3. Check browser console for errors
4. Ensure token and email parameters are in URL

## File Structure

```
Backend:
├── app/
│   ├── Http/Controllers/Api/
│   │   └── PasswordResetController.php
│   └── Notifications/
│       └── ResetPasswordNotification.php
├── routes/
│   └── api.php (password reset routes)
└── .env (email configuration)

Frontend:
├── src/app/
│   ├── core/
│   │   ├── pages/
│   │   │   ├── forgot-password/
│   │   │   │   ├── forgot-password.component.ts
│   │   │   │   ├── forgot-password.component.html
│   │   │   │   └── forgot-password.component.scss
│   │   │   └── reset-password/
│   │   │       ├── reset-password.component.ts
│   │   │       ├── reset-password.component.html
│   │   │       └── reset-password.component.scss
│   │   └── services/auth/
│   │       └── auth.service.ts (password reset methods)
│   └── app.routes.ts (password reset routes)
```

## Future Enhancements

Potential improvements for future iterations:

1. **Email Templates**: Custom HTML email templates with branding
2. **Rate Limiting**: Limit password reset requests per email/IP
3. **2FA Integration**: Require 2FA verification before reset
4. **Password History**: Prevent reusing recent passwords
5. **Account Activity Notifications**: Email when password is changed
6. **Multi-language Support**: Translate email content based on user preference
7. **SMS Reset Option**: Alternative to email for password reset

## Support

For issues or questions:
- Check Laravel logs: `storage/logs/laravel.log`
- Check Mailpit UI: http://localhost:8025 (local)
- Review browser console for frontend errors
- Test API endpoints with Postman/curl
