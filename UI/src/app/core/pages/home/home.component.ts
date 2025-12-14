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

@Component({
    selector: 'app-home',
    imports: [MatButtonModule, MatCardModule, RouterModule, MatIconModule, AlertComponent,],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
    menuItems = signal<DashboardItem[]>([]); //DashboardItem[] = []// dashboardItems
    destroy$: Subject<boolean> = new Subject();
    subtitles = signal<HomeSubtitle[]>([]);
    alerts = signal<MenuAlert[]>([]);
    private appService = inject(AppService);
    private authService = inject(AuthService);
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
        })
    }
}
