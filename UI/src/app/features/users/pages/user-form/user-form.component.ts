import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { UserData } from '../../../../core/models/user.model';
import { FormGeneratorComponent } from '../../../../libs/components/form-generator/form-generator.component';
import { IFormGenerator, FormField } from '../../../../libs/components/form-generator/form-generator.interface';
import { NotifyService } from '../../../../libs/services/notify.service';
import { CompanyService } from '../../../companies/services/company.service';
import { UserManagementService } from '../../services/user-management.service';

@Component({
    selector: 'app-user-form',
    imports: [
        CommonModule,
        FormGeneratorComponent,
        MatButtonModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './user-form.component.html',
    styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
    private userService = inject(UserManagementService);
    private companyService = inject(CompanyService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private notify = inject(NotifyService);

    userId: number | null = null;
    isEditMode = false;
    loading = false;
    formTitle = 'Create New User';

    formFields: IFormGenerator[] = [];
    roleOptions: { key: string; value: string }[] = [];
    companyOptions: { key: string; value: string }[] = [];

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') {
            this.userId = parseInt(id);
            this.isEditMode = true;
            this.formTitle = 'Edit User';
            this.loadUser();
        } else {
            this.loadDropdownOptions();
        }
    }

    loadDropdownOptions(user?: UserData) {
        this.loading = true;

        // Load roles and companies for dropdowns
        // For now, using static roles until we have a roles endpoint
        this.roleOptions = [
            { key: '1', value: 'Admin' },
            { key: '2', value: 'Company User' }
        ];

        this.companyService.getCompanies(1, 1000).subscribe({
            next: (response) => {
                this.companyOptions = [
                    { key: '', value: 'None' },
                    ...response.data.map(company => ({
                        key: company.id.toString(),
                        value: company.name
                    }))
                ];
                this.initializeForm(user);
                this.loading = false;
            },
            error: () => {
                this.notify.failNotification('Failed to load companies');
                this.loading = false;
            }
        });
    }

    initializeForm(user?: UserData) {
        this.formFields = [
            {
                ...new FormField('text'),
                name: 'name',
                label: 'Full Name',
                placeholder: 'Enter full name...',
                required: true,
                value: user?.name || '',
                hint: 'User\'s full name'
            },
            {
                ...new FormField('email'),
                name: 'email',
                label: 'Email',
                placeholder: 'user@example.com',
                required: true,
                value: user?.email || '',
                hint: 'Email address for login and notifications'
            }
        ];

        // Only show password field for new users or when editing
        if (!this.isEditMode) {
            this.formFields.push({
                ...new FormField('password'),
                name: 'password',
                label: 'Password',
                placeholder: 'Enter password...',
                required: true,
                value: '',
                hint: 'Minimum 8 characters'
            });
        } else {
            this.formFields.push({
                ...new FormField('password'),
                name: 'password',
                label: 'Password',
                placeholder: 'Leave empty to keep current password',
                required: false,
                value: '',
                hint: 'Leave empty to keep current password'
            });
        }

        this.formFields.push(
            {
                ...new FormField('select'),
                name: 'role_id',
                label: 'Role',
                required: true,
                value: user?.role_id.toString() || '2',
                options: this.roleOptions,
                hint: 'User role determines access permissions'
            },
            {
                ...new FormField('select'),
                name: 'company_id',
                label: 'Company',
                required: false,
                value: user?.company_id?.toString() || '',
                options: this.companyOptions,
                hint: 'Assign user to a company (required for Company User role)'
            },
            {
                ...new FormField('checkbox'),
                name: 'is_active',
                label: 'Active',
                required: false,
                value: user?.is_active !== undefined ? user.is_active : true,
                hint: 'Inactive users cannot log in'
            }
        );

        if (this.isEditMode && user) {
            // Add read-only fields for edit mode
            this.formFields.unshift(
                {
                    ...new FormField('text'),
                    name: 'id',
                    label: 'User ID',
                    required: false,
                    value: user.id.toString(),
                    disabled: 'disabled',
                    hint: 'System-generated user ID'
                }
            );
        }
    }

    loadUser() {
        if (!this.userId) return;

        this.loading = true;
        this.userService.getUser(this.userId).subscribe({
            next: (response) => {
                this.loadDropdownOptions(response.data);
            },
            error: () => {
                this.notify.failNotification('Failed to load user details');
                this.loading = false;
                this.router.navigate(['/users']);
            }
        });
    }

    onSubmit(formData: IFormGenerator[]) {
        const data: any = {};
        formData.forEach(field => {
            if (field.name !== 'id') { // Don't include id in updates
                // Convert string values to appropriate types
                if (field.name === 'role_id' || field.name === 'company_id') {
                    const value = field.value;
                    data[field.name] = value === '' || value === null ? null : parseInt(value as string);
                } else if (field.name === 'is_active') {
                    data[field.name] = field.value === true || field.value === 'true' || field.value === 1;
                } else if (field.name === 'password' && field.value === '') {
                    // Skip empty password in edit mode
                    if (!this.isEditMode) {
                        data[field.name] = field.value;
                    }
                } else {
                    data[field.name] = field.value;
                }
            }
        });

        // Validate company_id for company_user role
        if (data.role_id === 2 && !data.company_id) {
            this.notify.failNotification('Company User role requires a company assignment');
            return;
        }

        this.loading = true;

        const request = this.isEditMode && this.userId
            ? this.userService.updateUser(this.userId, data)
            : this.userService.createUser(data);

        request.subscribe({
            next: () => {
                this.notify.successNotification(
                    this.isEditMode ? 'User updated successfully' : 'User created successfully'
                );
                this.router.navigate(['/users']);
            },
            error: (error) => {
                this.notify.failNotification(
                    error.error?.message || 'Failed to save user'
                );
                this.loading = false;
            }
        });
    }

    cancel() {
        this.router.navigate(['/users']);
    }
}
