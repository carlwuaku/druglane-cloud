import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '../../models/user.model';
import { StatsCardComponent } from '../../../libs/components/stats-card/stats-card.component';
import { AlertComponent } from '../../../libs/components/alert/alert.component';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [StatsCardComponent, AlertComponent],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private data = toSignal(this.route.data);

    user = computed(() => this.data()?.['userData'] as User | null);

    // Stats signals - using dummy data for now
    totalCompanies = signal<number>(0);
    activeCompanies = signal<number>(0);
    totalUsers = signal<number>(0);
    activeUsers = signal<number>(0);

    loading = signal<boolean>(true);

    ngOnInit(): void {
        // Simulate API call with dummy data
        setTimeout(() => {
            this.totalCompanies.set(47);
            this.activeCompanies.set(42);
            this.totalUsers.set(156);
            this.activeUsers.set(142);
            this.loading.set(false);
        }, 800);
    }
}
