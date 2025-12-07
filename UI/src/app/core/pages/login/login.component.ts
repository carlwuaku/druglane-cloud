import { Component, HostListener, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { HttpService } from '../../services/http/http.service';
import { AppService } from '../../../app.service';
import { NotifyService } from '../../../libs/services/notify.service';
import { LoginResponse } from '../../models/user.model';
import { LOCAL_USER_TOKEN, LOGIN_FLASH_MESSSAGE } from '../../../libs/utils/constants';
import { Subject, take } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecaptchaModule } from 'ng-recaptcha-2';
import { LoadingComponent } from '../../../libs/components/loading/loading.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'app-login',
    imports: [MatCardModule, LoadingComponent, RouterModule, RecaptchaModule, MatButtonModule, MatInputModule, FormsModule, MatIconModule, MatSelectModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    private destroy$ = new Subject<void>();

    // Existing properties
    message: string = "";
    username!: string;
    password!: string;
    error: boolean = false;
    error_message: string = "";
    loading: boolean = false;
    flash_message: string | null = "";
    appName: string = "";
    logo: string = "";
    recaptchaVerified: boolean = true;
    recaptchaSiteKey: string = "";
    twoFactorAuthMode: boolean = false;
    twoFactorCode: string = "";
    twoFactorToken: string = "";

    // New properties for enhanced UI
    hidePassword = true;
    currentYear = new Date().getFullYear();
    loginAttempts = 0;
    maxLoginAttempts = 5;
    isFormAnimating = false;
    public authService = inject(AuthService);
    private dbService = inject(HttpService);
    private appService = inject(AppService);
    private notify = inject(NotifyService);
    private router = inject(Router);

    constructor() {
        this.appService.getAppSettings().subscribe(data => {
            this.appName = data.appLongName;
            this.logo = data.logo;
        })
    }

    ngOnInit(): void {
        this.initializeComponent();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


    private initializeComponent(): void {
        // this.authService.logout();

        this.loadFlashMessage();
        this.loadSavedUsername();
        this.addEntranceAnimation();
    }

    private loadFlashMessage(): void {
        this.flash_message = localStorage.getItem(LOGIN_FLASH_MESSSAGE);
        if (this.flash_message != null) {
            localStorage.removeItem(LOGIN_FLASH_MESSSAGE);
        }
    }

    private loadSavedUsername(): void {
        const savedUsername = localStorage.getItem('saved_username');
        if (savedUsername && !this.username) {
            this.username = savedUsername;
        }
    }

    private addEntranceAnimation(): void {
        setTimeout(() => {
            const card = document.querySelector('.login-card');
            card?.classList.add('animated');
        }, 100);
    }

    // Enhanced login method with better error handling
    login(): void {
        if (this.loading || this.isFormAnimating) return;

        // Validate form before submission
        if (!this.validateLoginForm()) {
            return;
        }

        if (!this.recaptchaVerified) {
            this.handleRecaptchaError();
            return;
        }

        this.startLoginProcess();

        let data = new FormData();
        data.append('email', this.username.trim());
        data.append('password', this.password);

        this.dbService.post<LoginResponse>(`api/login`, data)
            .pipe(take(1))
            .subscribe({
                next: (response) => {
                    this.handleLoginSuccess(response);
                },
                error: (err) => {
                    this.handleLoginError(err);
                },
            });
    }

    // Enhanced 2FA submission
    submit2FA(): void {
        if (this.loading || this.isFormAnimating) return;

        if (!this.validate2FAForm()) {
            return;
        }

        this.startLoginProcess();

        let data = new FormData();
        data.append('code', this.twoFactorCode.trim());
        data.append('token', this.twoFactorToken);
        data.append('verification_mode', '2fa');

        this.dbService.post<LoginResponse>(`portal/login`, data)
            .pipe(take(1))
            .subscribe({
                next: (response) => {
                    this.handleLoginSuccess(response);
                },
                error: (err) => {
                    this.handleLoginError(err);
                },
            });
    }

    // Enhanced form validation
    private validateLoginForm(): boolean {
        if (!this.username?.trim()) {
            this.showError('Username is required');
            this.focusField('username');
            return false;
        }

        if (this.username.trim().length < 3) {
            this.showError('Username must be at least 3 characters');
            this.focusField('username');
            return false;
        }

        if (!this.password) {
            this.showError('Password is required');
            this.focusField('password');
            return false;
        }

        if (this.password.length < 6) {
            this.showError('Password must be at least 6 characters');
            this.focusField('password');
            return false;
        }

        return true;
    }

    private validate2FAForm(): boolean {
        if (!this.twoFactorCode?.trim()) {
            this.showError('Authentication code is required');
            this.focusField('twoFactorCode');
            return false;
        }

        if (this.twoFactorCode.trim().length !== 6) {
            this.showError('Authentication code must be 6 digits');
            this.focusField('twoFactorCode');
            return false;
        }

        if (!/^\d{6}$/.test(this.twoFactorCode.trim())) {
            this.showError('Authentication code must contain only numbers');
            this.focusField('twoFactorCode');
            return false;
        }

        return true;
    }

    private startLoginProcess(): void {
        this.loading = true;
        this.clearErrors();
        this.isFormAnimating = true;
    }

    private handleLoginSuccess(response: any): void {
        if (response.requires_2fa) {
            this.twoFactorAuthMode = true;
            this.twoFactorToken = response.token;
            this.loading = false;
            this.isFormAnimating = false;
            this.clearErrors();
            this.addFormTransition();
            return;
        }

        // Store token and redirect
        localStorage.setItem(LOCAL_USER_TOKEN, response.token);
        this.authService.isLoggedIn$.next(true);
        this.router.navigate(['/home']);
        // Show success message
        this.notify.successNotification('Login successful! Welcome back.');


    }

    private handleLoginError(err: any): void {
        this.loading = false;
        this.isFormAnimating = false;
        this.loginAttempts++;

        const errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
        this.showError(errorMessage);

        // Add shake animation for visual feedback
        // this.addShakeAnimation();

        // Check for too many failed attempts
        if (this.loginAttempts >= this.maxLoginAttempts) {
            this.handleTooManyAttempts();
        }

        // Show additional help for repeated failures
        if (this.loginAttempts >= 3 && !this.twoFactorAuthMode) {
            this.notify.infoNotification('Having trouble logging in? Try using the "Forgot Password" link below.');
        }
    }

    private handleRecaptchaError(): void {
        this.error = true;
        this.error_message = "Please complete the reCAPTCHA verification";
        this.notify.failNotification("reCAPTCHA verification required");
        // this.addShakeAnimation();
    }

    private handleTooManyAttempts(): void {
        this.notify.failNotification('Too many failed attempts. Please wait before trying again or use the forgot password option.');

        // Optionally disable form temporarily
        setTimeout(() => {
            this.loginAttempts = 0; // Reset after some time
        }, 300000); // 5 minutes
    }

    // Go back from 2FA to regular login
    goBackToLogin(): void {
        this.twoFactorAuthMode = false;
        this.twoFactorCode = '';
        this.twoFactorToken = '';
        this.clearErrors();
        this.addFormTransition();
    }

    // Enhanced reCAPTCHA handling
    resolved(response: string | null): void {
        if (!response) {
            this.recaptchaError();
            return;
        }

        const body = { 'g-recaptcha-response': response };
        this.dbService.post<{ message: string }>('api/verify-recaptcha', body)
            .pipe(take(1))
            .subscribe({
                next: (res) => {
                    this.recaptchaVerified = true;
                    this.clearErrors();
                    this.notify.successNotification('reCAPTCHA verified successfully');
                },
                error: (err) => {
                    this.recaptchaVerified = false;
                    this.showError("reCAPTCHA verification failed. Please try again");
                    this.notify.failNotification("reCAPTCHA verification failed");
                },
            });
    }

    recaptchaError(): void {
        this.recaptchaVerified = false;
        this.showError("reCAPTCHA verification failed. Please try again");
        this.notify.failNotification("reCAPTCHA verification failed");
    }

    // Enhanced forgot password with better UX
    forgotPassword(): void {
        // Navigate to the new forgot password page instead of using prompt
        window.location.href = '/forgot-password';
    }

    // Utility methods for enhanced UX
    private showError(message: string): void {
        this.error = true;
        this.error_message = message;
    }

    private clearErrors(): void {
        this.error = false;
        this.error_message = '';
    }

    private focusField(fieldName: string): void {
        setTimeout(() => {
            const field = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
            field?.focus();
        }, 100);
    }

    private addShakeAnimation(): void {
        const card = document.querySelector('.login-card');
        if (card) {
            card.classList.add('shake');
            setTimeout(() => {
                card.classList.remove('shake');
            }, 500);
        }
    }

    private addFormTransition(): void {
        const form = document.querySelector('.login-form');
        if (form) {
            form.classList.add('fade-transition');
            setTimeout(() => {
                form.classList.remove('fade-transition');
            }, 300);
        }
    }

    // Keyboard event handling for better accessibility
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        // Handle Enter key
        if (event.key === 'Enter') {
            event.preventDefault();
            if (this.twoFactorAuthMode) {
                this.submit2FA();
            } else {
                this.login();
            }
        }

        // Handle Escape key to clear errors
        if (event.key === 'Escape') {
            this.clearErrors();
        }

        // Handle Tab navigation enhancement
        if (event.key === 'Tab') {
            this.handleTabNavigation(event);
        }
    }

    private handleTabNavigation(event: KeyboardEvent): void {
        // Add visual feedback for keyboard navigation
        setTimeout(() => {
            const activeElement = document.activeElement;
            if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'BUTTON') {
                activeElement.classList.add('keyboard-focus');
                setTimeout(() => {
                    activeElement.classList.remove('keyboard-focus');
                }, 200);
            }
        }, 50);
    }

    // Format 2FA input to ensure only numbers
    onTwoFactorInput(event: any): void {
        let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length > 6) {
            value = value.substring(0, 6);
        }
        this.twoFactorCode = value;

        // Auto-submit when 6 digits are entered
        if (value.length === 6) {
            setTimeout(() => {
                this.submit2FA();
            }, 500); // Small delay for better UX
        }
    }

    // Enhanced form validation getters for template
    get isLoginFormValid(): boolean {
        return !!(this.username?.trim() &&
            this.password &&
            this.username.trim().length >= 3 &&
            this.password.length >= 6 &&
            this.recaptchaVerified);
    }

    get is2FAFormValid(): boolean {
        return !!(this.twoFactorCode?.trim() &&
            this.twoFactorCode.trim().length === 6 &&
            /^\d{6}$/.test(this.twoFactorCode.trim()));
    }

    // Logout method (keeping existing functionality)
    logout(): void {
        this.authService.logout();
    }

    // Progressive form validation for real-time feedback
    onUsernameChange(): void {
        if (this.username?.trim()) {
            localStorage.setItem('saved_username', this.username.trim());
        }

        // Clear username-related errors when user starts typing
        if (this.error_message.toLowerCase().includes('username')) {
            this.clearErrors();
        }
    }

    onPasswordChange(): void {
        // Clear password-related errors when user starts typing
        if (this.error_message.toLowerCase().includes('password')) {
            this.clearErrors();
        }
    }

    // Check if user has exceeded login attempts
    get hasExceededAttempts(): boolean {
        return this.loginAttempts >= this.maxLoginAttempts;
    }

    // Get appropriate button text based on state
    get loginButtonText(): string {
        if (this.loading) {
            return this.twoFactorAuthMode ? 'Verifying...' : 'Signing In...';
        }
        return this.twoFactorAuthMode ? 'Verify' : 'Sign In';
    }

    // Get appropriate icon for login button
    get loginButtonIcon(): string {
        if (this.loading) {
            return '';
        }
        return this.twoFactorAuthMode ? 'verified_user' : 'login';
    }

    // ngOnInit() {
    //   this.userType = this.ar.snapshot.params['userType'];
    //   this.authService.logout();
    //   this.flash_message = localStorage.getItem(LOGIN_FLASH_MESSSAGE)
    //   if (this.flash_message != null) {
    //     localStorage.removeItem(LOGIN_FLASH_MESSSAGE);
    //   }
    // }

    // login() {
    //   if (!this.username || !this.password) {
    //     this.error = true;
    //     this.notify.failNotification("Please enter your username and password");
    //     this.error_message = "Please enter your username and password";
    //     return;
    //   }
    //   if (!this.userType) {
    //     this.error = true;
    //     this.notify.failNotification("No user type selected. Please go back to the home page and select a user type");
    //     this.error_message = "No user type selected. Please go back to the home page and select a user type";
    //     return;
    //   }
    //   if (!this.recaptchaVerified) {
    //     this.error = true;
    //     this.notify.failNotification("Recaptcha verification failed. Try again");
    //     this.error_message = "Recaptcha verification failed. Try again";
    //     return;
    //   }
    //   this.loading = true;
    //   this.error = false;

    //   let data = new FormData();
    //   data.append('email', this.username);
    //   data.append('password', this.password);
    //   data.append('device_name', 'practitioners portal');
    //   data.append('user_type', this.userType);
    //   this.dbService.post<{ token: string, requires_2fa: boolean, user: User, message: string }>(`api/mobile-login`, data)
    //     .pipe(take(1))
    //     .subscribe({
    //       next: (response) => {
    //         if (response.requires_2fa) {
    //           this.twoFactorAuthMode = true;
    //           this.twoFactorToken = response.token;
    //           this.loading = false;
    //           this.error = false;
    //           this.error_message = "";
    //           return;
    //         }
    //         localStorage.setItem(LOCAL_USER_TOKEN, response.token);
    //         window.location.assign('/');
    //       },
    //       error: (err) => {
    //         this.error = true;
    //         this.error_message = err.error.message
    //         this.loading = false;
    //       },
    //     });
    // }

    // submit2FA() {
    //   this.loading = true;
    //   this.error = false;

    //   let data = new FormData();
    //   data.append('code', this.twoFactorCode);
    //   data.append('token', this.twoFactorToken);
    //   data.append('device_name', 'practitioners portal');
    //   data.append('user_type', this.userType);
    //   data.append('verification_mode', '2fa');
    //   this.dbService.post<{ token: string, requires_2fa: boolean, user: User, message: string }>(`api/mobile-login`, data)
    //     .pipe(take(1))
    //     .subscribe({
    //       next: (response) => {

    //         localStorage.setItem(LOCAL_USER_TOKEN, response.token);
    //         // this.authService.currentUser = response.user;
    //         window.location.assign('/');
    //       },
    //       error: (err) => {
    //         this.error = true;
    //         this.error_message = err.error.message
    //         this.loading = false;
    //       },
    //     });
    // }

    // logout() {
    //   this.authService.logout();
    // }

    // forgotPassword() {
    //   let input = window.prompt("Enter your username. If you have forgotten your username please contact the Registration Unit for assistance");

    //   if (input) {
    //     const reg = input.trim();
    //     let data = new FormData();
    //     data.append("username", reg)
    //     this.dbService.post<{ message: string }>("send_reset_password_link_email", data).subscribe(data => {
    //       alert(data.message);


    //     });
    //   }
    // }

    // resolved(response: string | null) {
    //   if (!response) {
    //     this.recaptchaVerified = false;
    //     this.error_message = "Recaptcha verification failed. Try again";
    //     return;
    //   }
    //   const body = { 'g-recaptcha-response': response };
    //   this.dbService.post<{ message: string }>('api/verify-recaptcha', body).subscribe({
    //     next: (res) => {
    //       this.recaptchaVerified = true;
    //       this.error_message = "";
    //     },
    //     error: (err) => {
    //       // Handle HTTP error
    //       this.recaptchaVerified = false;
    //       this.error_message = "Recaptcha verification failed. Try again";
    //     },
    //   });


    // }

    // recaptchaError() {
    //   this.recaptchaVerified = false;
    //   this.error_message = "Recaptcha verification failed. Try again";
    // }

}
