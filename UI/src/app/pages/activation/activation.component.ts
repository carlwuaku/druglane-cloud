import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { LicenseService } from '../../services/license.service';

@Component({
  selector: 'app-activation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.scss']
})
export class ActivationComponent implements OnInit {
  activationForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  facilityData: any = null;

  constructor(
    private fb: FormBuilder,
    private licenseService: LicenseService,
    private router: Router
  ) {
    this.activationForm = this.fb.group({
      activationKey: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(20)]]
    });
  }

  ngOnInit(): void {
    // Check if already activated
    this.licenseService.checkActivationStatus().subscribe({
      next: (status) => {
        if (status.isActivated) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  onSubmit(): void {
    if (this.activationForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const activationKey = this.activationForm.value.activationKey.replace(/[^0-9]/g, '');

      this.licenseService.activate(activationKey).subscribe({
        next: (response) => {
          if (response.success) {
            this.facilityData = response.facilityData;
            // Show success message for 2 seconds then redirect
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Activation failed';
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.errorMessage = error.message || 'Activation failed. Please check your key and try again.';
          this.isLoading = false;
        }
      });
    }
  }

  get activationKey() {
    return this.activationForm.get('activationKey');
  }
}
