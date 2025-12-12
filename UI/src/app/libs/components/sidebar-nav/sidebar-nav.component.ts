import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { DashboardItem } from '../../types/MenuItem.interface';
import { AuthService } from '../../../core/services/auth/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-sidebar-nav',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatExpansionModule,
        MatIconModule,
        MatListModule,
        MatButtonModule
    ],
    templateUrl: './sidebar-nav.component.html',
    styleUrl: './sidebar-nav.component.scss'
})
export class SidebarNavComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);

    menuItems = signal<DashboardItem[]>([]);
    currentUser = signal<User | null>(null);

    constructor() {
        // Get current user
        this.authService.getUser()
            .pipe(takeUntilDestroyed())
            .subscribe(user => {
                this.currentUser.set(user);
                this.buildMenuItems(user);
            });
    }

    private buildMenuItems(user: User): void {
        const menuItems: DashboardItem[] = [];

        if (user.isAdmin) {
            // Admin menu items
            menuItems.push(
                {
                    title: 'Dashboard',
                    description: 'Admin Dashboard',
                    url: '/dashboard',
                    urlParams: {},
                    image: 'dashboard',
                    icon: 'dashboard',
                    options: [],
                    permissions: [],
                    actions: [],
                    alerts: [],
                    dataPoints: []
                },
                {
                    title: 'Companies',
                    description: 'Manage Companies',
                    url: '/companies',
                    urlParams: {},
                    image: 'business',
                    icon: 'business',
                    options: [],
                    permissions: [],
                    actions: [
                        {
                            type: 'link',
                            label: 'View All Companies',
                            icon: 'list',
                            url: '/companies',
                            urlParams: {}
                        },
                        {
                            type: 'link',
                            label: 'Add New Company',
                            icon: 'add_business',
                            url: '/companies/new',
                            urlParams: {}
                        }
                    ],
                    alerts: [],
                    dataPoints: []
                },
                {
                    title: 'Users',
                    description: 'Manage Users',
                    url: '/users',
                    urlParams: {},
                    image: 'people',
                    icon: 'people',
                    options: [],
                    permissions: [],
                    actions: [
                        {
                            type: 'link',
                            label: 'View All Users',
                            icon: 'list',
                            url: '/users',
                            urlParams: {}
                        },
                        {
                            type: 'link',
                            label: 'Add New User',
                            icon: 'person_add',
                            url: '/users/new',
                            urlParams: {}
                        }
                    ],
                    alerts: [],
                    dataPoints: []
                }
            );
        } else if (user.isCompanyUser) {
            // Company user menu items
            menuItems.push(
                {
                    title: 'Dashboard',
                    description: 'Inventory Dashboard',
                    url: '/dashboard',
                    urlParams: {},
                    image: 'dashboard',
                    icon: 'dashboard',
                    options: [],
                    permissions: [],
                    actions: [],
                    alerts: [],
                    dataPoints: []
                },
                {
                    title: 'Products',
                    description: 'Manage Products',
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
                    description: 'Sales Management',
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
                    title: 'Purchases',
                    description: 'Purchase Management',
                    url: '/purchases',
                    urlParams: {},
                    image: 'shopping_bag',
                    icon: 'shopping_bag',
                    options: [],
                    permissions: [],
                    actions: [],
                    alerts: [],
                    dataPoints: []
                }
            );
        }

        this.menuItems.set(menuItems);
    }

    ngOnInit(): void { }

    navigateTo(url: string, params?: any): void {
        if (params) {
            this.router.navigate([url], { queryParams: params });
        } else {
            this.router.navigate([url]);
        }
    }

    executeAction(action: any): void {
        if (action.type === 'button' && action.onClick) {
            action.onClick();
        } else if (action.type === 'link') {
            this.navigateTo(action.url, action.urlParams);
        }
    }
}
