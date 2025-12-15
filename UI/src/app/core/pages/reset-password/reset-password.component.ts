import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { NotifyService } from '../../../libs/services/notify.service';
import { LoadingComponent } from '../../../libs/components/loading/loading.component';

@Component({
    selector: 'app-reset-password',
    imports: [
        CommonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        RouterModule,
        LoadingComponent
    ],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private notify = inject(NotifyService);

    token = signal<string>('');
    email = signal<string>('');
    password = signal<string>('');
    passwordConfirmation = signal<string>('');

    loading = signal<boolean>(false);
    verifyingToken = signal<boolean>(true);
    tokenValid = signal<boolean>(false);
    hidePassword = signal<boolean>(true);
    hidePasswordConfirmation = signal<boolean>(true);
    currentYear = new Date().getFullYear();

    ngOnInit(): void {
        // Get token and email from query params
        this.route.queryParams.subscribe(params => {
            const token = params['token'];
            const email = params['email'];

            if (!token || !email) {
                this.notify.failNotification('Invalid password reset link');
                this.router.navigate(['/login']);
                return;
            }

            this.token.set(token);
            this.email.set(email);

            // Verify the token
            this.verifyToken();
        });
    }

    verifyToken() {
        this.verifyingToken.set(true);

        this.authService.verifyResetToken(this.token(), this.email()).subscribe({
            next: (response) => {
                this.verifyingToken.set(false);
                if (response.valid) {
                    this.tokenValid.set(true);
                } else {
                    this.notify.failNotification(response.message || 'Invalid or expired reset link');
                    setTimeout(() => {
                        this.router.navigate(['/forgot-password']);
                    }, 2000);
                }
            },
            error: (error) => {
                this.verifyingToken.set(false);
                this.notify.failNotification('Failed to verify reset link');
                setTimeout(() => {
                    this.router.navigate(['/forgot-password']);
                }, 2000);
            }
        });
    }

    get isFormValid(): boolean {
        return this.password().length >= 8 &&
            this.password() === this.passwordConfirmation();
    }

    get passwordsMatch(): boolean {
        if (!this.passwordConfirmation()) return true; // Don't show error until user types
        return this.password() === this.passwordConfirmation();
    }

    get passwordStrength(): 'weak' | 'medium' | 'strong' {
        const pwd = this.password();
        if (pwd.length < 8) return 'weak';

        let strength = 0;
        if (pwd.length >= 12) strength++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

        if (strength >= 3) return 'strong';
        if (strength >= 2) return 'medium';
        return 'weak';
    }

    resetPassword() {
        if (!this.isFormValid || this.loading()) {
            return;
        }

        this.loading.set(true);

        this.authService.resetPassword(
            this.token(),
            this.email(),
            this.password(),
            this.passwordConfirmation()
        ).subscribe({
            next: (response) => {
                this.loading.set(false);
                this.notify.successNotification(response.message);
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 1500);
            },
            error: (error) => {
                this.loading.set(false);
                const errorMessage = error.error?.message ||
                    error.error?.errors?.password?.[0] ||
                    'Failed to reset password. Please try again.';
                this.notify.failNotification(errorMessage);
            }
        });
    }

    backToLogin() {
        this.router.navigate(['/login']);
    }
}
