import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '../../models/user.model';
import { StatsCardComponent } from '../../../libs/components/stats-card/stats-card.component';
import { AlertComponent } from '../../../libs/components/alert/alert.component';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
    selector: 'app-company-dashboard',
    standalone: true,
    imports: [StatsCardComponent, AlertComponent, MatTabsModule],
    templateUrl: './company-dashboard.component.html',
    styleUrl: './company-dashboard.component.scss'
})
export class CompanyDashboardComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private data = toSignal(this.route.data);

    user = computed(() => this.data()?.['userData'] as User | null);

    // Inventory Stats - using dummy data for now
    totalProducts = signal<number>(0);
    todaySales = signal<number>(0);
    expiredProducts = signal<number>(0);
    expiringNextMonth = signal<number>(0);
    outOfStock = signal<number>(0);
    nearingMinStock = signal<number>(0);
    exceedingMaxStock = signal<number>(0);
    activeProducts = signal<number>(0);

    loading = signal<boolean>(true);

    ngOnInit(): void {
        // Simulate API call with dummy data
        setTimeout(() => {
            this.totalProducts.set(1247);
            this.todaySales.set(3450);
            this.expiredProducts.set(23);
            this.expiringNextMonth.set(87);
            this.outOfStock.set(15);
            this.nearingMinStock.set(42);
            this.exceedingMaxStock.set(8);
            this.activeProducts.set(1201);
            this.loading.set(false);
        }, 800);
    }
}
