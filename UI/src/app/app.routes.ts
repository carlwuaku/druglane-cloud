import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { companyUserGuard } from './core/guards/company-user.guard';
import { userResolver } from './core/resolvers/user.resolver';
import { appSettingsResolver } from './core/resolvers/app-settings.resolver';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        data: { title: 'Dashboard' },
        canActivate: [authGuard],
        loadComponent: () => import('./core/pages/home/home.component').then(m => m.HomeComponent),
        resolve: { userData: userResolver, appSettings: appSettingsResolver },
    },

    {
        path: 'login',
        data: { title: 'Login' },
        loadComponent: () => import('./core/pages/login/login.component').then(m => m.LoginComponent),
        canActivate: [],
    },

    {
        path: 'activate',
        data: { title: 'Activate System' },
        loadComponent: () => import('./features/license/activate.component').then(m => m.ActivateComponent),
    },

    {
        path: 'companies',
        canActivate: [authGuard, adminGuard],
        children: [
            {
                path: '',
                data: { title: 'Companies' },
                loadComponent: () => import('./features/companies/pages/companies-list/companies-list.component').then(m => m.CompaniesListComponent),
            },
            {
                path: 'new',
                data: { title: 'Create Company' },
                loadComponent: () => import('./features/companies/pages/company-form/company-form.component').then(m => m.CompanyFormComponent),
            },
            {
                path: ':id/edit',
                data: { title: 'Edit Company' },
                loadComponent: () => import('./features/companies/pages/company-form/company-form.component').then(m => m.CompanyFormComponent),
            },
            {
                path: ':id',
                data: { title: 'Company Details' },
                loadComponent: () => import('./features/companies/pages/company-form/company-form.component').then(m => m.CompanyFormComponent),
            }
        ]
    },

    {
        path: 'users',
        canActivate: [authGuard, adminGuard],
        children: [
            {
                path: '',
                data: { title: 'Users' },
                loadComponent: () => import('./features/users/pages/users-list/users-list.component').then(m => m.UsersListComponent),
            },
            {
                path: 'new',
                data: { title: 'Create User' },
                loadComponent: () => import('./features/users/pages/user-form/user-form.component').then(m => m.UserFormComponent),
            },
            {
                path: ':id/edit',
                data: { title: 'Edit User' },
                loadComponent: () => import('./features/users/pages/user-form/user-form.component').then(m => m.UserFormComponent),
            },
            {
                path: ':id',
                data: { title: 'User Details' },
                loadComponent: () => import('./features/users/pages/user-form/user-form.component').then(m => m.UserFormComponent),
            }
        ]
    },

    // Company User Routes
    {
        path: 'products',
        data: { title: 'Products' },
        canActivate: [authGuard, companyUserGuard],
        loadComponent: () => import('./core/pages/home/home.component').then(m => m.HomeComponent),
    },
    {
        path: 'sales',
        data: { title: 'Sales' },
        canActivate: [authGuard, companyUserGuard],
        loadComponent: () => import('./core/pages/home/home.component').then(m => m.HomeComponent),
    },
    {
        path: 'purchases',
        data: { title: 'Purchases' },
        canActivate: [authGuard, companyUserGuard],
        loadComponent: () => import('./core/pages/home/home.component').then(m => m.HomeComponent),
    },

];
