import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AppService } from '../../../app.service';
import { DashboardItem, MenuAlert } from '../../../libs/types/MenuItem.interface';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DashboardTileComponent } from "../../../libs/components/dashboard-tile/dashboard-tile.component";
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth/auth.service';
import { HomeSubtitle } from '../../../libs/types/HomeSubtitle.type';
import { AppSettings } from '../../../libs/types/AppSettings.interface';
import { MatIconModule } from '@angular/material/icon';
import { AlertComponent } from "../../../libs/components/alert/alert.component";
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyService, AdminStatistics } from '../../../features/companies/services/company.service';
import { StatsCardComponent } from '../../../libs/components/stats-card/stats-card.component';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
    selector: 'app-home',
    imports: [CommonModule, MatButtonModule, MatCardModule, RouterModule, MatIconModule, AlertComponent, StatsCardComponent, MatExpansionModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
    menuItems = signal<DashboardItem[]>([]); //DashboardItem[] = []// dashboardItems
    destroy$: Subject<boolean> = new Subject();
    subtitles = signal<HomeSubtitle[]>([]);
    alerts = signal<MenuAlert[]>([]);
    statistics = signal<AdminStatistics | null>(null);
    loading = signal<boolean>(true);

    private appService = inject(AppService);
    private authService = inject(AuthService);
    private companyService = inject(CompanyService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private data = toSignal(this.route.data);
    institutionSettings = computed(() => this.data()?.['appSettings'] as AppSettings | null);
    user = computed(() => this.data()?.['userData'] as User | null);
    // institutionSettings = signal<AppSettings>({
    //   appName: '',
    //   appVersion: '',
    //   appLongName: '',
    //   portalName: '',
    //   logo: '',
    //   whiteLogo: '',
    //   loginBackground: '',
    //   recaptchaSiteKey: '',
    //   dashboardMenu: [],
    //   portalHomeMenu: [],
    //   institutionPhone: '',
    //   institutionEmail: '',
    //   institutionAddress: '',
    //   institutionWebsite: '',
    //   portalContactUsSubtitle: '',
    //   portalContactUsTitle: '',
    //   institutionWhatsapp: '',
    //   portalFooterBackground: '',
    // })
    constructor() {

    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    ngOnInit(): void {
        // Redirect company users to their specific dashboard
        const currentUser = this.user();
        if (currentUser?.isCompanyUser) {
            this.router.navigate(['/company-dashboard'], { replaceUrl: true });
            return;
        }

        // Admin users stay on this dashboard component
        this.authService.getHomeMenu().pipe(takeUntil(this.destroy$)).subscribe(data => {
            this.menuItems.set(data.data.dashboardMenu);
            this.subtitles.set(data.data.subtitles);
            this.alerts.set(data.data.alerts);
        });

        // Load admin statistics
        this.loadStatistics();
    }

    loadStatistics(): void {
        this.loading.set(true);
        this.companyService.getAdminStatistics().pipe(takeUntil(this.destroy$)).subscribe({
            next: (stats) => {
                this.statistics.set(stats);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Failed to load admin statistics', error);
                this.loading.set(false);
            }
        });
    }
}
