import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Company } from '../../../../core/models/user.model';
import { FormGeneratorComponent } from '../../../../libs/components/form-generator/form-generator.component';
import { IFormGenerator, FormField } from '../../../../libs/components/form-generator/form-generator.interface';
import { NotifyService } from '../../../../libs/services/notify.service';
import { CompanyService } from '../../services/company.service';

@Component({
    selector: 'app-company-form',
    imports: [
        CommonModule,
        FormGeneratorComponent,
        MatButtonModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './company-form.component.html',
    styleUrl: './company-form.component.scss'
})
export class CompanyFormComponent implements OnInit {
    private companyService = inject(CompanyService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private notify = inject(NotifyService);

    companyId: number | null = null;
    isEditMode = false;
    loading = false;
    formTitle = 'Create New Company';

    formFields: IFormGenerator[] = [];

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') {
            this.companyId = parseInt(id);
            this.isEditMode = true;
            this.formTitle = 'Edit Company';
            this.loadCompany();
        } else {
            this.initializeForm();
        }
    }

    initializeForm(company?: Company) {
        this.formFields = [
            {
                ...new FormField('text'),
                name: 'name',
                label: 'Company Name',
                placeholder: 'Enter company name...',
                required: true,
                value: company?.name || '',
                hint: 'The official name of the company'
            },
            {
                ...new FormField('email'),
                name: 'contact_email',
                label: 'Contact Email',
                placeholder: 'company@example.com',
                required: false,
                value: company?.contact_email || '',
                hint: 'Primary contact email for the company'
            },
            {
                ...new FormField('text'),
                name: 'contact_phone',
                label: 'Contact Phone',
                placeholder: '+1 (555) 123-4567',
                required: false,
                value: company?.contact_phone || '',
                hint: 'Primary contact phone number'
            },
            {
                ...new FormField('textarea'),
                name: 'address',
                label: 'Address',
                placeholder: 'Street address...',
                required: false,
                value: company?.address || '',
                hint: 'Company physical address'
            },
            {
                ...new FormField('text'),
                name: 'city',
                label: 'City',
                placeholder: 'City name...',
                required: false,
                value: company?.city || ''
            },
            {
                ...new FormField('text'),
                name: 'country',
                label: 'Country',
                placeholder: 'Country name...',
                required: false,
                value: company?.country || ''
            },
            {
                ...new FormField('select'),
                name: 'license_status',
                label: 'License Status',
                required: true,
                value: company?.license_status || 'active',
                options: [
                    { key: 'active', value: 'Active' },
                    { key: 'suspended', value: 'Suspended' },
                    { key: 'expired', value: 'Expired' }
                ],
                hint: 'Current status of the license'
            },
            {
                ...new FormField('date'),
                name: 'license_expires_at',
                label: 'License Expiry Date',
                required: false,
                value: company?.license_expires_at || '',
                hint: 'Leave empty for no expiration'
            },
            {
                ...new FormField('textarea'),
                name: 'notes',
                label: 'Notes',
                placeholder: 'Additional notes...',
                required: false,
                value: company?.notes || '',
                hint: 'Internal notes about this company'
            }
        ];

        if (this.isEditMode && company) {
            // Add read-only fields for edit mode
            this.formFields.unshift(
                {
                    ...new FormField('text'),
                    name: 'license_key',
                    label: 'License Key',
                    required: false,
                    value: company.license_key,
                    disabled: 'disabled',
                    hint: 'Auto-generated license key (cannot be modified)'
                }
            );
        }
    }

    loadCompany() {
        if (!this.companyId) return;

        this.loading = true;
        this.companyService.getCompany(this.companyId).subscribe({
            next: (company) => {
                this.initializeForm(company);
                this.loading = false;
            },
            error: () => {
                this.notify.failNotification('Failed to load company details');
                this.loading = false;
                this.router.navigate(['/companies']);
            }
        });
    }

    onSubmit(formData: IFormGenerator[]) {
        const data: any = {};
        formData.forEach(field => {
            if (field.name !== 'license_key') { // Don't include license_key in updates
                data[field.name] = field.value;
            }
        });

        this.loading = true;

        const request = this.isEditMode && this.companyId
            ? this.companyService.updateCompany(this.companyId, data)
            : this.companyService.createCompany(data);

        request.subscribe({
            next: () => {
                this.notify.successNotification(
                    this.isEditMode ? 'Company updated successfully' : 'Company created successfully'
                );
                this.router.navigate(['/companies']);
            },
            error: (error) => {
                this.notify.failNotification(
                    error.error?.message || 'Failed to save company'
                );
                this.loading = false;
            }
        });
    }

    cancel() {
        this.router.navigate(['/companies']);
    }
}
