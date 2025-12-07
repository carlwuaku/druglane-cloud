import { Routes } from '@angular/router';
import { HomeComponent } from './core/pages/home/home.component';
import { authGuard } from './core/auth/auth.guard';
import { userResolver } from './core/resolvers/user.resolver';
import { appSettingsResolver } from './core/resolvers/app-settings.resolver';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        data: { title: 'Home' },
        component: HomeComponent,
        canActivate: [authGuard],
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
        canActivate: [authGuard],
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
        canActivate: [authGuard],
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

];
