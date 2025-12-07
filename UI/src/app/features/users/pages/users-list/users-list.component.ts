import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UserData } from '../../../../core/models/user.model';
import { IFormGenerator, FormField } from '../../../../libs/components/form-generator/form-generator.interface';
import { LoadDataListComponent } from '../../../../libs/components/load-data-list/load-data-list.component';
import { NotifyService } from '../../../../libs/services/notify.service';
import { DataActionsButton } from '../../../../libs/types/DataAction.type';
import { UserManagementService } from '../../services/user-management.service';

@Component({
    selector: 'app-users-list',
    imports: [LoadDataListComponent, MatIconModule],
    templateUrl: './users-list.component.html',
    styleUrl: './users-list.component.scss'
})
export class UsersListComponent {
    private userService = inject(UserManagementService);
    private router = inject(Router);
    private notify = inject(NotifyService);

    displayedColumns: string[] = [
        'name',
        'email',
        'role',
        'company',
        'is_active',
        'last_login_at',
        'created_at'
    ];

    columnLabels: { [key: string]: string } = {
        'name': 'Name',
        'email': 'Email',
        'role': 'Role',
        'company': 'Company',
        'is_active': 'Status',
        'last_login_at': 'Last Login',
        'created_at': 'Created'
    };

    specialClasses: { [key: string]: string } = {
        'is_active': 'badge'
    };

    customClassRules: { [key: string]: (row: UserData) => boolean } = {
        'badge-success': (row: UserData) => row.is_active,
        'badge-danger': (row: UserData) => !row.is_active
    };

    filters: IFormGenerator[] = [
        {
            ...new FormField('text'),
            name: 'name',
            label: 'Name',
            placeholder: 'Search by name...',
            required: false,
            value: ''
        },
        {
            ...new FormField('text'),
            name: 'email',
            label: 'Email',
            placeholder: 'Search by email...',
            required: false,
            value: ''
        },
        {
            ...new FormField('select'),
            name: 'role_id',
            label: 'Role',
            required: false,
            value: '',
            options: [
                { key: '', value: 'All' },
                { key: '1', value: 'Admin' },
                { key: '2', value: 'Company User' }
            ]
        },
        {
            ...new FormField('select'),
            name: 'is_active',
            label: 'Status',
            required: false,
            value: '',
            options: [
                { key: '', value: 'All' },
                { key: '1', value: 'Active' },
                { key: '0', value: 'Inactive' }
            ]
        }
    ];

    getActions = (row: UserData): DataActionsButton[] => {
        const actions: DataActionsButton[] = [
            {
                label: 'View Details',
                icon: 'visibility',
                onClick: (row: UserData) => { this.viewUser(row) },
                className: 'btn-primary',
                type: 'button'
            },
            {
                label: 'Edit',
                icon: 'edit',
                onClick: (row: UserData) => { this.editUser(row) },
                className: 'btn-secondary',
                type: 'button'
            }
        ];

        if (row.is_active) {
            actions.push({
                label: 'Deactivate',
                icon: 'cancel',
                onClick: (row: UserData) => { this.deactivateUser(row) },
                className: 'btn-warning',
                type: 'button'
            });
        } else {
            actions.push({
                label: 'Activate',
                icon: 'check_circle',
                onClick: (row: UserData) => { this.activateUser(row) },
                className: 'btn-success',
                type: 'button'
            });
        }

        actions.push({
            label: 'Delete',
            icon: 'delete',
            onClick: (row: UserData) => { this.deleteUser(row) },
            className: 'btn-danger',
            type: 'button'
        });

        return actions;
    };

    viewUser(user: UserData) {
        this.router.navigate(['/users', user.id]);
    }

    editUser(user: UserData) {
        this.router.navigate(['/users', user.id, 'edit']);
    }

    activateUser(user: UserData) {
        if (confirm(`Are you sure you want to activate ${user.name}?`)) {
            this.userService.activateUser(user.id).subscribe({
                next: () => {
                    this.notify.successNotification('User activated successfully');
                    window.location.reload();
                },
                error: () => {
                    this.notify.failNotification('Failed to activate user');
                }
            });
        }
    }

    deactivateUser(user: UserData) {
        if (confirm(`Are you sure you want to deactivate ${user.name}?`)) {
            this.userService.deactivateUser(user.id).subscribe({
                next: () => {
                    this.notify.successNotification('User deactivated successfully');
                    window.location.reload();
                },
                error: () => {
                    this.notify.failNotification('Failed to deactivate user');
                }
            });
        }
    }

    deleteUser(user: UserData) {
        if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            this.userService.deleteUser(user.id).subscribe({
                next: () => {
                    this.notify.successNotification('User deleted successfully');
                    window.location.reload();
                },
                error: () => {
                    this.notify.failNotification('Failed to delete user');
                }
            });
        }
    }

    createUser() {
        this.router.navigate(['/users/new']);
    }
}
