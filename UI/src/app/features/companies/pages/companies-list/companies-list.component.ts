import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Company } from '../../../../core/models/user.model';
import { IFormGenerator, FormField } from '../../../../libs/components/form-generator/form-generator.interface';
import { LoadDataListComponent } from '../../../../libs/components/load-data-list/load-data-list.component';
import { NotifyService } from '../../../../libs/services/notify.service';
import { DataActionsButton } from '../../../../libs/types/DataAction.type';
import { CompanyService } from '../../services/company.service';

@Component({
    selector: 'app-companies-list',
    imports: [LoadDataListComponent, MatIconModule],
    templateUrl: './companies-list.component.html',
    styleUrl: './companies-list.component.scss'
})
export class CompaniesListComponent {
    private companyService = inject(CompanyService);
    private router = inject(Router);
    private notify = inject(NotifyService);

    displayedColumns: string[] = [
        'name',
        'license_key',
        'license_status',
        'is_activated',
        'license_expires_at',
        'created_at'
    ];

    columnLabels: { [key: string]: string } = {
        'name': 'Company Name',
        'license_key': 'License Key',
        'license_status': 'License Status',
        'is_activated': 'Activated',
        'license_expires_at': 'Expires',
        'created_at': 'Created'
    };

    specialClasses: { [key: string]: string } = {
        'license_status': 'badge',
        'is_activated': 'badge'
    };

    customClassRules: { [key: string]: (row: Company) => boolean } = {
        'badge-success': (row: Company) => row.license_status === 'active',
        'badge-warning': (row: Company) => row.license_status === 'suspended',
        'badge-danger': (row: Company) => row.license_status === 'expired' || this.isLicenseExpired(row),
        'text-success': (row: Company) => row.is_activated,
        'text-muted': (row: Company) => !row.is_activated
    };

    filters: IFormGenerator[] = [
        {
            ...new FormField('text'),
            name: 'name',
            label: 'Company Name',
            placeholder: 'Search by name...',
            required: false,
            value: ''
        },
        {
            ...new FormField('select'),
            name: 'license_status',
            label: 'License Status',
            required: false,
            value: '',
            options: [
                { key: '', value: 'All' },
                { key: 'active', value: 'Active' },
                { key: 'expired', value: 'Expired' },
                { key: 'suspended', value: 'Suspended' }
            ]
        },
        {
            ...new FormField('select'),
            name: 'is_activated',
            label: 'Activation Status',
            required: false,
            value: '',
            options: [
                { key: '', value: 'All' },
                { key: '1', value: 'Activated' },
                { key: '0', value: 'Not Activated' }
            ]
        }
    ];

    getActions = (row: Company): DataActionsButton[] => {
        const actions: DataActionsButton[] = [
            {
                label: 'View Details',
                icon: 'visibility',
                onClick: (row: Company) => { this.viewCompany(row) },
                className: 'btn-primary',
                type: 'button'
            },
            {
                label: 'Edit',
                icon: 'edit',
                onClick: (row: Company) => { this.editCompany(row) },
                className: 'btn-secondary',
                type: 'button'
            }
        ];

        if (row.is_activated) {
            actions.push({
                label: 'Deactivate',
                icon: 'cancel',
                onClick: (row: Company) => { this.deactivateCompany(row) },
                className: 'btn-warning',
                type: 'button'
            });
        } else {
            actions.push({
                label: 'Activate',
                icon: 'check_circle',
                onClick: (row: Company) => { this.activateCompany(row) },
                className: 'btn-success',
                type: 'button'
            });
        }

        actions.push({
            label: 'Renew License',
            icon: 'update',
            onClick: (row: Company) => { this.renewLicense(row) },
            className: 'btn-info',
            type: 'button'
        });

        return actions;
    };

    viewCompany(company: Company) {
        this.router.navigate(['/companies', company.id]);
    }

    editCompany(company: Company) {
        this.router.navigate(['/companies', company.id, 'edit']);
    }

    activateCompany(company: Company) {
        if (confirm(`Are you sure you want to activate ${company.name}?`)) {
            this.companyService.activateCompany(company.id).subscribe({
                next: () => {
                    this.notify.successNotification('Company activated successfully');
                    window.location.reload(); // Reload to refresh the list
                },
                error: () => {
                    this.notify.failNotification('Failed to activate company');
                }
            });
        }
    }

    deactivateCompany(company: Company) {
        if (confirm(`Are you sure you want to deactivate ${company.name}?`)) {
            this.companyService.deactivateCompany(company.id).subscribe({
                next: () => {
                    this.notify.successNotification('Company deactivated successfully');
                    window.location.reload(); // Reload to refresh the list
                },
                error: () => {
                    this.notify.failNotification('Failed to deactivate company');
                }
            });
        }
    }

    renewLicense(company: Company) {
        this.router.navigate(['/companies', company.id, 'renew-license']);
    }

    createCompany() {
        this.router.navigate(['/companies/new']);
    }

    isLicenseExpired(company: Company): boolean {
        if (!company.license_expires_at) return false;
        return new Date(company.license_expires_at) < new Date();
    }
}
