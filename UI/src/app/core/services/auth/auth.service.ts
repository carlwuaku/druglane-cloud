import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, Subject, throwError } from 'rxjs';
import { User, ProfileResponse } from '../../models/user.model';
import { HttpService } from '../http/http.service';
import { Router } from '@angular/router';
import { LOCAL_USER_TOKEN } from '../../../libs/utils/constants';
import { DashboardItem, MenuAlert } from '../../../libs/types/MenuItem.interface';
import { HomeSubtitle } from '../../../libs/types/HomeSubtitle.type';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    currentUser: User | null = null;
    isLoggedIn$: Subject<boolean> = new Subject();
    private httpService = inject(HttpService);
    private router = inject(Router);
    constructor() { }

    public hasPermission(permission: string): boolean {
        // For now, admin users have all permissions
        if (this.currentUser?.isAdmin) {
            return true;
        }
        // You can extend this logic based on your permission system
        return false;
    }

    // Add an observable-based hasPermission method
    hasPermissionAsync(permission: string): Observable<boolean> {
        return this.getUser().pipe(
            map(user => {
                if (user.isAdmin) {
                    return true;
                }
                return false;
            })
        );
    }

    public logout(): void {
        localStorage.removeItem(LOCAL_USER_TOKEN);
        this.isLoggedIn$.next(false);

        this.currentUser = null;
    }


    setCookie(cname: string, cvalue: string) {
        localStorage.setItem(cname, cvalue);
    }

    checkLogin(): boolean {
        const token = this.getCookie(LOCAL_USER_TOKEN);
        if (token !== null) {
            this.isLoggedIn$.next(true);
            return true;
        }

        this.isLoggedIn$.next(false);
        this.router.navigate(['/login']);
        return false;
    }

    getCookie(cname: string) {
        return localStorage.getItem(cname);
    }

    getUser(): Observable<User> {
        if (this.currentUser) {
            return of(this.currentUser);
        }

        return this.httpService.get<ProfileResponse>("api/profile").pipe(
            map(data => {
                this.currentUser = new User(data);
                return this.currentUser;
            }),
            catchError(error => {
                if (error.status === 401) {
                    // You can throw a custom error or use the original error
                    return throwError(() => new Error('Unauthorized access'));
                    // Alternatively: return throwError(() => error);
                }
                // For other errors, either handle them differently or just pass them through
                return throwError(() => error);
            })
        );
    }

    getAuthToken(): string | null {
        return localStorage.getItem(LOCAL_USER_TOKEN);
    }

    /**
     * Send password reset link to email
     */
    sendPasswordResetLink(email: string): Observable<{ message: string }> {
        return this.httpService.post<{ message: string }>('api/password/forgot', { email });
    }

    /**
     * Reset password with token
     */
    resetPassword(token: string, email: string, password: string, password_confirmation: string): Observable<{ message: string }> {
        return this.httpService.post<{ message: string }>('api/password/reset', {
            token,
            email,
            password,
            password_confirmation
        });
    }

    /**
     * Verify if password reset token is valid
     */
    verifyResetToken(token: string, email: string): Observable<{ valid: boolean, message: string }> {
        return this.httpService.post<{ valid: boolean, message: string }>('api/password/verify-token', {
            token,
            email
        });
    }

    getHomeMenu(): Observable<{ data: { dashboardMenu: DashboardItem[], subtitles: HomeSubtitle[], alerts: MenuAlert[] } }> {
        return this.getUser().pipe(
            map(user => {
                const menuItems: DashboardItem[] = [];
                const subtitles: HomeSubtitle[] = [];
                const alerts: MenuAlert[] = [];

                if (user.isAdmin) {
                    // Admin menu items
                    menuItems.push(
                        {
                            title: 'Manage Companies',
                            description: 'View and manage all companies',
                            url: '/companies',
                            urlParams: {},
                            image: 'business',
                            icon: 'business',
                            options: [],
                            permissions: [],
                            actions: [],
                            alerts: [],
                            dataPoints: []
                        },
                        {
                            title: 'Manage Users',
                            description: 'View and manage system users',
                            url: '/users',
                            urlParams: {},
                            image: 'people',
                            icon: 'people',
                            options: [],
                            permissions: [],
                            actions: [],
                            alerts: [],
                            dataPoints: []
                        },
                        {
                            title: 'License Management',
                            description: 'Manage company licenses and activations',
                            url: '/licenses',
                            urlParams: {},
                            image: 'verified_user',
                            icon: 'verified_user',
                            options: [],
                            permissions: [],
                            actions: [],
                            alerts: [],
                            dataPoints: []
                        },
                        {
                            title: 'System Settings',
                            description: 'Configure system-wide settings',
                            url: '/settings',
                            urlParams: {},
                            image: 'settings',
                            icon: 'settings',
                            options: [],
                            permissions: [],
                            actions: [],
                            alerts: [],
                            dataPoints: []
                        }
                    );

                    subtitles.push(
                        { label: 'Role', template: user.role.display_name },
                        { label: 'Email', template: user.email }
                    );
                } else if (user.isCompanyUser) {
                    // Company user menu items
                    menuItems.push(
                        {
                            title: 'Products',
                            description: 'View and manage your products',
                            url: '/products',
                            urlParams: {},
                            image: 'inventory_2',
                            icon: 'inventory_2',
                            options: [],
                            permissions: [],
                            actions: [],
                            alerts: [],
                            dataPoints: []
                        },
                        {
                            title: 'Sales',
                            description: 'View sales transactions and reports',
                            url: '/sales',
                            urlParams: {},
                            image: 'shopping_cart',
                            icon: 'shopping_cart',
                            options: [],
                            permissions: [],
                            actions: [],
                            alerts: [],
                            dataPoints: []
                        },
                        {
                            title: 'Transactions',
                            description: 'View all transactions',
                            url: '/transactions',
                            urlParams: {},
                            image: 'receipt_long',
                            icon: 'receipt_long',
                            options: [],
                            permissions: [],
                            actions: [],
                            alerts: [],
                            dataPoints: []
                        },
                        {
                            title: 'Reports',
                            description: 'Generate and view reports',
                            url: '/reports',
                            urlParams: {},
                            image: 'assessment',
                            icon: 'assessment',
                            options: [],
                            permissions: [],
                            actions: [],
                            alerts: [],
                            dataPoints: []
                        },
                        {
                            title: 'Company Profile',
                            description: 'View and update company information',
                            url: '/company-profile',
                            urlParams: {},
                            image: 'domain',
                            icon: 'domain',
                            options: [],
                            permissions: [],
                            actions: [],
                            alerts: [],
                            dataPoints: []
                        }
                    );

                    subtitles.push(
                        { label: 'Company', template: user.company?.name || 'N/A' },
                        { label: 'Role', template: user.role.display_name }
                    );

                    // Add license expiry alert if applicable
                    if (user.company && user.company.license_expires_at) {
                        const expiryDate = new Date(user.company.license_expires_at);
                        const today = new Date();
                        const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
                            alerts.push({
                                type: 'warning',
                                message: `Your license will expire in ${daysUntilExpiry} days. Please contact your administrator to renew.`
                            });
                        } else if (daysUntilExpiry <= 0) {
                            alerts.push({
                                type: 'danger',
                                message: 'Your license has expired. Please contact your administrator to renew.'
                            });
                        }
                    }
                }

                return {
                    data: {
                        dashboardMenu: menuItems,
                        subtitles: subtitles,
                        alerts: alerts
                    }
                };
            })
        );
    }
}
