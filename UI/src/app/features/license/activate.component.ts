import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LicenseService } from '../../core/services/license/license.service';
import { NotifyService } from '../../libs/services/notify.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './activate.component.html',
  styleUrl: './activate.component.scss'
})
export class ActivateComponent {
  private fb = inject(FormBuilder);
  private licenseService = inject(LicenseService);
  private notifyService = inject(NotifyService);
  private router = inject(Router);

  activationForm: FormGroup;
  isLoading = signal(false);
  activationSuccess = signal(false);
  facilityData = signal<any>(null);

  constructor() {
    this.activationForm = this.fb.group({
      activationKey: ['', [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(20),
        Validators.pattern(/^[0-9]{20}$/)
      ]]
    });
  }

  get activationKey() {
    return this.activationForm.get('activationKey');
  }

  /**
   * Submit activation request
   */
  onSubmit(): void {
    if (this.activationForm.invalid) {
      this.notifyService.failNotification('Please enter a valid 20-digit activation key');
      return;
    }

    this.isLoading.set(true);
    const activationKey = this.activationForm.value.activationKey;

    this.licenseService.activate(activationKey).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.activationSuccess.set(true);
          this.facilityData.set(response.facilityData);
          this.notifyService.successNotification(response.message || 'Activation successful!');

          // Redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.notifyService.failNotification(response.message || 'Activation failed');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Activation error', error);
        this.notifyService.failNotification(error.message || 'Activation failed. Please check your key and try again.');
      }
    });
  }
}
