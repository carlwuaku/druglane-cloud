import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LicenseService, LicenseStatus } from '../../core/services/license/license.service';
import { Router } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-license-status',
  standalone: true,
  imports: [CommonModule, BadgeModule, TooltipModule],
  template: `
    <div class="license-status" *ngIf="licenseStatus()">
      @if (licenseStatus()?.isActivated) {
        <div
          class="status-badge activated"
          [pTooltip]="getTooltipText()"
          tooltipPosition="bottom"
        >
          <i class="pi pi-shield"></i>
          <span class="status-text">Licensed</span>
          @if (daysUntilExpiration() !== null && daysUntilExpiration()! < 30) {
            <p-badge
              [value]="daysUntilExpiration()!.toString()"
              severity="warning"
            />
          }
        </div>
      } @else {
        <div
          class="status-badge not-activated"
          (click)="navigateToActivation()"
          pTooltip="Click to activate system"
          tooltipPosition="bottom"
        >
          <i class="pi pi-exclamation-triangle"></i>
          <span class="status-text">Not Activated</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .license-status {
      display: inline-flex;
      align-items: center;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.3s ease;

      i {
        font-size: 1rem;
      }

      &.activated {
        background: rgba(76, 175, 80, 0.1);
        color: var(--color-primary);
        border: 1px solid var(--color-primary);

        &:hover {
          background: rgba(76, 175, 80, 0.2);
        }
      }

      &.not-activated {
        background: rgba(244, 67, 54, 0.1);
        color: var(--color-danger);
        border: 1px solid var(--color-danger);
        cursor: pointer;

        &:hover {
          background: rgba(244, 67, 54, 0.2);
          transform: translateY(-1px);
        }
      }

      .status-text {
        white-space: nowrap;
      }
    }

    @media (max-width: 768px) {
      .status-text {
        display: none;
      }
    }
  `]
})
export class LicenseStatusComponent implements OnInit {
  private licenseService = inject(LicenseService);
  private router = inject(Router);

  licenseStatus = signal<LicenseStatus | null>(null);
  daysUntilExpiration = signal<number | null>(null);

  ngOnInit(): void {
    // Subscribe to license status changes
    this.licenseService.licenseStatus$.subscribe(status => {
      this.licenseStatus.set(status);
      if (status?.daysUntilExpiration !== undefined) {
        this.daysUntilExpiration.set(status.daysUntilExpiration);
      }
    });

    // Trigger initial check if status is not available
    if (!this.licenseService.getCurrentStatus()) {
      this.licenseService.checkLicenseStatus().subscribe();
    }
  }

  getTooltipText(): string {
    const status = this.licenseStatus();
    if (!status?.isActivated) {
      return 'System not activated';
    }

    let text = `Licensed to: ${status.facilityName}\n`;
    if (status.licenseNumber) {
      text += `License: ${status.licenseNumber}\n`;
    }
    if (status.expiresOn) {
      text += `Expires: ${new Date(status.expiresOn).toLocaleDateString()}`;
      if (status.daysUntilExpiration !== null && status.daysUntilExpiration !== undefined) {
        text += ` (${status.daysUntilExpiration} days remaining)`;
      }
    } else {
      text += 'Perpetual License';
    }
    return text;
  }

  navigateToActivation(): void {
    this.router.navigate(['/activate']);
  }
}
