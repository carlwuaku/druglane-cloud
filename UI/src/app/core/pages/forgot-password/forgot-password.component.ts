import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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
    selector: 'app-forgot-password',
    imports: [
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        RouterModule,
        LoadingComponent
    ],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
    private authService = inject(AuthService);
    private router = inject(Router);
    private notify = inject(NotifyService);

    email = signal<string>('');
    loading = signal<boolean>(false);
    emailSent = signal<boolean>(false);
    currentYear = new Date().getFullYear();

    get isEmailValid(): boolean {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(this.email());
    }

    sendResetLink() {
        if (!this.isEmailValid || this.loading()) {
            return;
        }

        this.loading.set(true);

        this.authService.sendPasswordResetLink(this.email()).subscribe({
            next: (response) => {
                this.loading.set(false);
                this.emailSent.set(true);
                this.notify.successNotification(response.message);
            },
            error: (error) => {
                this.loading.set(false);
                this.notify.failNotification(error.error?.message || 'Failed to send reset link. Please try again.');
            }
        });
    }

    backToLogin() {
        this.router.navigate(['/login']);
    }
}
